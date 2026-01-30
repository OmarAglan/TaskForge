import React, { useEffect, useState } from 'react';
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
  Divider,
  Skeleton,
  CircularProgress,
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
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { TaskPriorityChip, TaskStatusChip, TaskDueDateBadge } from '../../components/tasks';
import { TeamDialog } from '../../components/teams';
import { TaskDialog } from '../../components/tasks';
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../../types/task.types';
import { Team, CreateTeamDto, TeamMember } from '../../types/team.types';
import { toast } from '../../utils/toast';
import * as teamsApi from '../../api/teams.api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={40} />
          ) : (
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          )}
          {trend && !loading && (
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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { tasks, isLoading: tasksLoading, loadMyTasks, createTask } = useTasks();
  const { teams, isLoading: teamsLoading, loadTeams, createTeam } = useTeams();

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const firstName = user?.firstName || 'User';

  // Load data on mount
  useEffect(() => {
    loadMyTasks({ limit: 10 });
    loadTeams();
  }, []);

  // Calculate stats
  const myTasksCount = tasks.length;
  const teamsCount = teams.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const dueTodayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(t.dueDate);
    return dueDate.toDateString() === today.toDateString();
  });

  // Get recent tasks (not completed)
  const recentTasks = tasks
    .filter(t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED)
    .slice(0, 5);

  // Handle team creation
  const handleCreateTeam = async (data: CreateTeamDto | UpdateTeamDto): Promise<Team> => {
    return await createTeam(data as CreateTeamDto);
  };

  const handleTeamSuccess = () => {
    setTeamDialogOpen(false);
    toast.success('Team created successfully');
    loadTeams();
  };

  // Handle task creation
  const handleCreateTask = async (data: CreateTaskDto | UpdateTaskDto): Promise<Task> => {
    return await createTask(data as CreateTaskDto);
  };

  const handleLoadTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    return await teamsApi.getTeamMembers(teamId);
  };

  const handleTaskSuccess = () => {
    setTaskDialogOpen(false);
    toast.success('Task created successfully');
    loadMyTasks({ limit: 10 });
  };

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
            value={myTasksCount}
            icon={<TaskIcon />}
            color="primary.main"
            loading={tasksLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Teams"
            value={teamsCount}
            icon={<TeamIcon />}
            color="secondary.main"
            loading={teamsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={completedTasks}
            icon={<TrendingUpIcon />}
            color="success.main"
            loading={tasksLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Due Today"
            value={dueTodayTasks.length}
            icon={<ScheduleIcon />}
            color="warning.main"
            loading={tasksLoading}
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
            onClick={() => setTaskDialogOpen(true)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickAction
            title="Create Team"
            description="Start a new team collaboration"
            icon={<TeamIcon />}
            onClick={() => setTeamDialogOpen(true)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickAction
            title="View All Tasks"
            description="See your complete task list"
            icon={<AssignmentIcon />}
            onClick={() => navigate('/tasks/my')}
          />
        </Grid>
      </Grid>

      {/* Recent Tasks and Due Today */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  My Recent Tasks
                </Typography>
                <Button size="small" onClick={() => navigate('/tasks/my')}>
                  View All
                </Button>
              </Box>
              {tasksLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : recentTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No tasks yet. Create your first task!
                </Typography>
              ) : (
                <List disablePadding>
                  {recentTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        disablePadding
                        sx={{ py: 1, cursor: 'pointer' }}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                            <TaskIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {task.title}
                            </Typography>
                          }
                          secondary={task.team?.name || 'No team'}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TaskStatusChip status={task.status} />
                        </Box>
                      </ListItem>
                      {index < recentTasks.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
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
                <Button size="small" onClick={() => navigate('/tasks/my')}>
                  View All
                </Button>
              </Box>
              {tasksLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : dueTodayTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No tasks due today. Great job! 🎉
                </Typography>
              ) : (
                <List disablePadding>
                  {dueTodayTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        disablePadding
                        sx={{ py: 1, cursor: 'pointer' }}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.light' }}>
                            <TaskIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                              {task.title}
                            </Typography>
                          }
                          secondary={task.dueDate && <TaskDueDateBadge dueDate={task.dueDate} />}
                        />
                        <TaskPriorityChip priority={task.priority} />
                      </ListItem>
                      {index < dueTodayTasks.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Team Dialog */}
      <TeamDialog
        open={teamDialogOpen}
        onClose={() => setTeamDialogOpen(false)}
        onSuccess={handleTeamSuccess}
        onSubmit={handleCreateTeam}
      />

      {/* Create Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        teams={teams}
        onClose={() => setTaskDialogOpen(false)}
        onSuccess={handleTaskSuccess}
        onSubmit={handleCreateTask}
        onLoadTeamMembers={handleLoadTeamMembers}
      />
    </Box>
  );
};

export default DashboardPage;