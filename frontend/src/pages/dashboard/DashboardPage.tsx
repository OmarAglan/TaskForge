import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  Task as TaskIcon,
  Group as TeamIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" color="success.main">
              {trend}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, onClick }) => (
  <Card
    sx={{
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ textAlign: 'center', py: 3 }}>
      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
        {icon}
      </Avatar>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

// Mock data for recent activity (will be replaced with real data in Phase 9)
const recentActivities = [
  { id: 1, action: 'Created task', item: 'Design homepage mockup', time: '2 hours ago' },
  { id: 2, action: 'Joined team', item: 'Marketing Team', time: '5 hours ago' },
  { id: 3, action: 'Completed task', item: 'Update user documentation', time: '1 day ago' },
  { id: 4, action: 'Assigned to', item: 'Review pull request #42', time: '2 days ago' },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const firstName = user?.firstName || 'User';

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your tasks and teams today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Tasks"
            value={12}
            icon={<TaskIcon />}
            color="primary.main"
            trend="+2 this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Teams"
            value={3}
            icon={<TeamIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={24}
            icon={<TrendingUpIcon />}
            color="success.main"
            trend="+8 this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Due Today"
            value={3}
            icon={<ScheduleIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <QuickAction
            title="Create Task"
            description="Add a new task to your list"
            icon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickAction
            title="Create Team"
            description="Start a new team collaboration"
            icon={<TeamIcon />}
            onClick={() => navigate('/teams/new')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickAction
            title="View All Tasks"
            description="See your complete task list"
            icon={<AssignmentIcon />}
            onClick={() => navigate('/tasks')}
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activity
                </Typography>
                <Button size="small" onClick={() => navigate('/analytics')}>
                  View All
                </Button>
              </Box>
              <List disablePadding>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start" disablePadding sx={{ py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                          <TaskIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            {activity.action}{' '}
                            <Typography component="span" fontWeight="medium">
                              {activity.item}
                            </Typography>
                          </Typography>
                        }
                        secondary={activity.time}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Tasks Due Today
                </Typography>
                <Button size="small" onClick={() => navigate('/tasks?filter=today')}>
                  View All
                </Button>
              </Box>
              <List disablePadding>
                {/* Placeholder for tasks due today - will be populated from API */}
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.light' }}>
                      <TaskIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Complete project proposal"
                    secondary="Due at 5:00 PM"
                  />
                  <Chip label="High" color="error" size="small" />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.light' }}>
                      <TaskIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Review team submissions"
                    secondary="Due at 6:00 PM"
                  />
                  <Chip label="Medium" color="warning" size="small" />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.light' }}>
                      <TaskIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Send weekly report"
                    secondary="Due at 11:59 PM"
                  />
                  <Chip label="Low" color="default" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;