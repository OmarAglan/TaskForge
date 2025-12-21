import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Skeleton } from '@mui/material';
import {
  Task as TaskIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  Group as MembersIcon,
} from '@mui/icons-material';

export interface TeamStatsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  memberCount: number;
}

export interface TeamStatsProps {
  stats: TeamStatsData;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, isLoading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box>
          {isLoading ? (
            <>
              <Skeleton width={60} height={32} />
              <Skeleton width={80} height={20} />
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight="bold">
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Component for displaying team statistics
 */
export const TeamStats: React.FC<TeamStatsProps> = ({ stats, isLoading = false }) => {
  const statItems = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: <TaskIcon />,
      color: '#1976d2',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: <CompletedIcon />,
      color: '#2e7d32',
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      icon: <InProgressIcon />,
      color: '#ed6c02',
    },
    {
      title: 'Members',
      value: stats.memberCount,
      icon: <MembersIcon />,
      color: '#9c27b0',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statItems.map((item) => (
        <Grid item xs={6} sm={3} key={item.title}>
          <StatCard
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            isLoading={isLoading}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default TeamStats;