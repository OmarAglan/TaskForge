import { TeamRole } from '../entities/team-member.entity';

export class TeamPermissionsHelper {
  /**
   * Check if user can manage team (update team details)
   * Only OWNER and ADMIN can manage team
   */
  static canManageTeam(userRole: TeamRole): boolean {
    return userRole === TeamRole.OWNER || userRole === TeamRole.ADMIN;
  }

  /**
   * Check if user can manage members (add/remove members)
   * Only OWNER and ADMIN can manage members
   */
  static canManageMembers(userRole: TeamRole): boolean {
    return userRole === TeamRole.OWNER || userRole === TeamRole.ADMIN;
  }

  /**
   * Check if user can manage roles (change member roles)
   * Only OWNER can manage roles
   */
  static canManageRoles(userRole: TeamRole): boolean {
    return userRole === TeamRole.OWNER;
  }

  /**
   * Check if user can delete team
   * Only OWNER can delete team
   */
  static canDeleteTeam(userRole: TeamRole): boolean {
    return userRole === TeamRole.OWNER;
  }

  /**
   * Check if a role can be assigned by the current user
   * OWNER cannot be assigned (only transferred)
   */
  static canAssignRole(currentUserRole: TeamRole, roleToAssign: TeamRole): boolean {
    // Cannot assign OWNER role (must transfer ownership separately)
    if (roleToAssign === TeamRole.OWNER) {
      return false;
    }

    // Only OWNER can assign ADMIN role
    if (roleToAssign === TeamRole.ADMIN) {
      return currentUserRole === TeamRole.OWNER;
    }

    // OWNER and ADMIN can assign MEMBER role
    return this.canManageMembers(currentUserRole);
  }

  /**
   * Check if user can remove a specific member
   * - OWNER can remove anyone except themselves
   * - ADMIN can remove MEMBER but not OWNER or other ADMINs
   */
  static canRemoveMember(
    currentUserRole: TeamRole,
    targetMemberRole: TeamRole,
    isSelf: boolean,
  ): boolean {
    // Cannot remove yourself (must leave team or delete it)
    if (isSelf) {
      return false;
    }

    // OWNER can remove anyone
    if (currentUserRole === TeamRole.OWNER) {
      return true;
    }

    // ADMIN can only remove MEMBER
    if (currentUserRole === TeamRole.ADMIN) {
      return targetMemberRole === TeamRole.MEMBER;
    }

    return false;
  }
}