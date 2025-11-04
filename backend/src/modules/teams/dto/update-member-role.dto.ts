import { IsEnum } from 'class-validator';
import { TeamRole } from '../entities/team-member.entity';

export class UpdateMemberRoleDto {
  @IsEnum(TeamRole, { message: 'Role must be either ADMIN or MEMBER' })
  role: TeamRole.ADMIN | TeamRole.MEMBER;
}