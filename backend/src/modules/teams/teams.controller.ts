import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /**
   * POST /teams
   * Create a new team
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createTeamDto: CreateTeamDto,
  ) {
    const team = await this.teamsService.create(userId, createTeamDto);
    return {
      success: true,
      data: team,
      message: 'Team created successfully',
    };
  }

  /**
   * GET /teams
   * Get all teams where the user is a member
   */
  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    const teams = await this.teamsService.findAll(userId);
    return {
      success: true,
      data: teams,
    };
  }

  /**
   * GET /teams/:id
   * Get a single team by ID
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const team = await this.teamsService.findOne(id, userId);
    return {
      success: true,
      data: team,
    };
  }

  /**
   * PATCH /teams/:id
   * Update team details
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    const team = await this.teamsService.update(id, userId, updateTeamDto);
    return {
      success: true,
      data: team,
      message: 'Team updated successfully',
    };
  }

  /**
   * DELETE /teams/:id
   * Delete a team
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.teamsService.remove(id, userId);
    return {
      success: true,
      message: 'Team deleted successfully',
    };
  }

  /**
   * GET /teams/:id/members
   * Get all members of a team
   */
  @Get(':id/members')
  async getMembers(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const members = await this.teamsService.getMembers(id, userId);
    return {
      success: true,
      data: members,
    };
  }

  /**
   * POST /teams/:id/members
   * Add a member to a team
   */
  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    const member = await this.teamsService.addMember(id, userId, addMemberDto);
    return {
      success: true,
      data: member,
      message: 'Member added successfully',
    };
  }

  /**
   * DELETE /teams/:id/members/:memberId
   * Remove a member from a team
   */
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.teamsService.removeMember(id, userId, memberId);
    return {
      success: true,
      message: 'Member removed successfully',
    };
  }

  /**
   * PATCH /teams/:id/members/:memberId/role
   * Update a member's role
   */
  @Patch(':id/members/:memberId/role')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
  ) {
    const member = await this.teamsService.updateMemberRole(
      id,
      userId,
      memberId,
      updateRoleDto,
    );
    return {
      success: true,
      data: member,
      message: 'Member role updated successfully',
    };
  }
}