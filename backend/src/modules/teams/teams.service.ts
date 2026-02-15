import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember, TeamRole } from './entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { TeamPermissionsHelper } from './helpers/team-permissions.helper';
import { WebSocketService } from '../websocket/websocket.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    private readonly websocketService: WebSocketService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new team and automatically add the creator as OWNER
   */
  async create(userId: string, createTeamDto: CreateTeamDto): Promise<Team> {
    // Create team
    const team = this.teamRepository.create({
      ...createTeamDto,
      ownerId: userId,
    });

    const savedTeam = await this.teamRepository.save(team);

    // Automatically add creator as OWNER
    const ownerMember = this.teamMemberRepository.create({
      teamId: savedTeam.id,
      userId: userId,
      role: TeamRole.OWNER,
    });

    await this.teamMemberRepository.save(ownerMember);

    // Real-time: creator should join the new team room without needing reconnect
    this.websocketService.addUserToTeamRoom(userId, savedTeam.id);
    this.websocketService.emitTeamCreated(savedTeam, userId);

    return savedTeam;
  }

  /**
   * Get all teams where the user is a member
   */
  async findAll(userId: string): Promise<Team[]> {
    const memberships = await this.teamMemberRepository.find({
      where: { userId },
      relations: ['team', 'team.owner'],
    });

    return memberships.map((membership) => membership.team);
  }

  /**
   * Get a single team by ID with member check
   */
  async findOne(id: string, userId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Check if user is a member of the team
    const isMember = await this.checkMembership(id, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return team;
  }

  /**
   * Update team details (only OWNER/ADMIN)
   */
  async update(
    id: string,
    userId: string,
    updateTeamDto: UpdateTeamDto,
  ): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Get user's role in the team
    const userRole = await this.getUserRole(id, userId);
    if (!userRole) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check permission
    if (!TeamPermissionsHelper.canManageTeam(userRole)) {
      throw new ForbiddenException(
        'You do not have permission to update this team',
      );
    }

    // Update team
    Object.assign(team, updateTeamDto);
    const updatedTeam = await this.teamRepository.save(team);

    this.websocketService.emitTeamUpdated(updatedTeam, userId);

    return updatedTeam;
  }

  /**
   * Delete team (only OWNER)
   */
  async remove(id: string, userId: string): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Get user's role in the team
    const userRole = await this.getUserRole(id, userId);
    if (!userRole) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check permission
    if (!TeamPermissionsHelper.canDeleteTeam(userRole)) {
      throw new ForbiddenException(
        'Only the team owner can delete the team',
      );
    }

    // Real-time: notify connected team members before deletion
    this.websocketService.emitTeamDeleted(team.id, userId);

    // Delete team (cascade will delete members and tasks)
    await this.teamRepository.remove(team);
  }

  /**
   * Add a member to the team (only OWNER/ADMIN)
   */
  async addMember(
    teamId: string,
    userId: string,
    addMemberDto: AddMemberDto,
  ): Promise<TeamMember> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Get user's role in the team
    const userRole = await this.getUserRole(teamId, userId);
    if (!userRole) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check permission
    if (!TeamPermissionsHelper.canManageMembers(userRole)) {
      throw new ForbiddenException(
        'You do not have permission to add members',
      );
    }

    // Check if role can be assigned
    if (!TeamPermissionsHelper.canAssignRole(userRole, addMemberDto.role)) {
      throw new ForbiddenException(
        `You do not have permission to assign the ${addMemberDto.role} role`,
      );
    }

    // Check if user is already a member
    const existingMember = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        userId: addMemberDto.userId,
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this team');
    }

    // Add member
    const member = this.teamMemberRepository.create({
      teamId,
      userId: addMemberDto.userId,
      role: addMemberDto.role,
    });

    const savedMember = await this.teamMemberRepository.save(member);

    // Real-time: add new member sockets to team room
    this.websocketService.addUserToTeamRoom(addMemberDto.userId, teamId);

    // Real-time: broadcast to team
    this.websocketService.emitTeamMemberAdded(team, savedMember, userId);

    // Notification: notify the added member
    await this.notificationsService.create(
      addMemberDto.userId,
      NotificationType.TEAM_MEMBER_ADDED,
      'Added to team',
      `You were added to team "${team.name}"`,
      { teamId: team.id, teamName: team.name },
    );

    return savedMember;
  }

  /**
   * Remove a member from the team (only OWNER/ADMIN)
   */
  async removeMember(
    teamId: string,
    userId: string,
    memberId: string,
  ): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Get user's role in the team
    const userRole = await this.getUserRole(teamId, userId);
    if (!userRole) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Get target member
    const targetMember = await this.teamMemberRepository.findOne({
      where: { id: memberId, teamId },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found in this team');
    }

    // Check if trying to remove self
    const isSelf = targetMember.userId === userId;

    // Check permission
    if (
      !TeamPermissionsHelper.canRemoveMember(
        userRole,
        targetMember.role,
        isSelf,
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission to remove this member',
      );
    }

    // Cannot remove the owner
    if (targetMember.role === TeamRole.OWNER) {
      throw new BadRequestException(
        'Cannot remove the team owner. Transfer ownership first.',
      );
    }

    // Remove member
    await this.teamMemberRepository.remove(targetMember);

    // Real-time: notify team members (emit first so removed user still receives it if connected)
    this.websocketService.emitTeamMemberRemoved(team, targetMember.userId, userId);

    // Real-time: remove user sockets from team room
    this.websocketService.removeUserFromTeamRoom(targetMember.userId, teamId);
  }

  /**
   * Update a member's role (only OWNER)
   */
  async updateMemberRole(
    teamId: string,
    userId: string,
    memberId: string,
    updateRoleDto: UpdateMemberRoleDto,
  ): Promise<TeamMember> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Get user's role in the team
    const userRole = await this.getUserRole(teamId, userId);
    if (!userRole) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check permission
    if (!TeamPermissionsHelper.canManageRoles(userRole)) {
      throw new ForbiddenException(
        'Only the team owner can change member roles',
      );
    }

    // Get target member
    const targetMember = await this.teamMemberRepository.findOne({
      where: { id: memberId, teamId },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found in this team');
    }

    // Cannot change owner's role
    if (targetMember.role === TeamRole.OWNER) {
      throw new BadRequestException('Cannot change the owner role');
    }

    // Check if role can be assigned
    if (!TeamPermissionsHelper.canAssignRole(userRole, updateRoleDto.role)) {
      throw new ForbiddenException(
        `You do not have permission to assign the ${updateRoleDto.role} role`,
      );
    }

    // Update role
    targetMember.role = updateRoleDto.role;
    const updatedMember = await this.teamMemberRepository.save(targetMember);

    this.websocketService.emitTeamMemberRoleChanged(team, updatedMember, userId);

    return updatedMember;
  }

  /**
   * Get all members of a team
   */
  async getMembers(teamId: string, userId: string): Promise<TeamMember[]> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check if user is a member
    const isMember = await this.checkMembership(teamId, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return this.teamMemberRepository.find({
      where: { teamId },
      relations: ['user'],
    });
  }

  /**
   * Check if a user is a member of a team
   */
  async checkMembership(teamId: string, userId: string): Promise<boolean> {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    return !!member;
  }

  /**
   * Get user's role in a team
   */
  async getUserRole(teamId: string, userId: string): Promise<TeamRole | null> {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    return member ? member.role : null;
  }
}