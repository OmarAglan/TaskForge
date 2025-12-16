import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { TeamRole } from '../../types/team.types';

export interface MemberRoleChipProps extends Omit<ChipProps, 'label' | 'color'> {
role: TeamRole;
}

/**

Get role display label
*/
export const getRoleLabel = (role: TeamRole): string => {
const labels: Record<TeamRole, string> = {
[TeamRole.OWNER]: 'Owner',
[TeamRole.ADMIN]: 'Admin',
[TeamRole.MEMBER]: 'Member',
};
return labels[role] || role;
};
/**

Get role chip color based on role type
*/
const getRoleColor = (role: TeamRole): ChipProps['color'] => {
switch (role) {
case TeamRole.OWNER:
return 'warning';
case TeamRole.ADMIN:
return 'primary';
case TeamRole.MEMBER:
default:
return 'default';
}
};
/**

Get role chip styles for custom colors
*/
const getRoleStyles = (role: TeamRole) => {
switch (role) {
case TeamRole.OWNER:
return {
backgroundColor: '#FFD700',
color: '#000000',
fontWeight: 600,
};
case TeamRole.ADMIN:
return {
backgroundColor: '#1976d2',
color: '#ffffff',
fontWeight: 500,
};
case TeamRole.MEMBER:
default:
return {
backgroundColor: '#e0e0e0',
color: '#616161',
};
}
};
/**

Chip component for displaying team member roles
*/
export const MemberRoleChip: React.FC<MemberRoleChipProps> = ({
role,
size = 'small',
variant = 'filled',
...props
}) => {
return (
<Chip
label={getRoleLabel(role)}
size={size}
variant={variant}
sx={{
...getRoleStyles(role),
...props.sx,
}}
{...props}
/>
);
};
export default MemberRoleChip;