import { IsUUID, IsEnum } from 'class-validator';
import { TeamRole } from '../entities/team-member.entity';

export class AddMemberDto {
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @IsEnum(TeamRole, { message: 'Role must be either ADMIN or MEMBER' })
  role: TeamRole.ADMIN | TeamRole.MEMBER;
}