import React from 'react';
import { Card, CardContent, Box, Skeleton, AvatarGroup, Avatar } from '@mui/material';

export interface TeamCardSkeletonProps {
  count?: number;
}

/**
 * Skeleton loader for TeamCard component
 */
export const TeamCardSkeleton: React.FC<{ showActions?: boolean }> = ({ showActions = true }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header with actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
          </Box>
          {showActions && <Skeleton variant="circular" width={32} height={32} />}
        </Box>

        {/* Description */}
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="85%" />

        {/* Members */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <AvatarGroup max={4}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="circular" width={32} height={32}>
                <Avatar />
              </Skeleton>
            ))}
          </AvatarGroup>
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Multiple team card skeletons in a grid
 */
export const TeamCardSkeletonGrid: React.FC<TeamCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TeamCardSkeleton key={index} />
      ))}
    </>
  );
};

export default TeamCardSkeleton;