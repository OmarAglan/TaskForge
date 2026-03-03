import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import * as tasksApi from '../../api/tasks.api';
import * as teamsApi from '../../api/teams.api';
import { Task, TaskPriority, TaskStatus, getPriorityLabel, getStatusLabel } from '../../types/task.types';
import { Team } from '../../types/team.types';
import { formatNumber } from '../../utils/helpers';
import { toast } from '../../utils/toast';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_ORDER: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.COMPLETED,
  TaskStatus.CANCELLED,
];

const PRIORITY_ORDER: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
];

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const AnalyticsPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const [tasksResponse, teamsResponse] = await Promise.all([
          tasksApi.getTasks({
            page: 1,
            limit: 500,
            sortBy: 'createdAt',
            sortOrder: 'DESC',
          }),
          teamsApi.getTeams(),
        ]);

        if (!isActive) {
          return;
        }

        setTasks(tasksResponse.data);
        setTeams(teamsResponse);
      } catch {
        toast.error('Failed to load analytics data');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadAnalyticsData();

    return () => {
      isActive = false;
    };
  }, []);

  const byStatus = useMemo(() => {
    const counters: Record<TaskStatus, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.IN_REVIEW]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.CANCELLED]: 0,
    };

    tasks.forEach((task) => {
      counters[task.status] += 1;
    });

    return counters;
  }, [tasks]);

  const byPriority = useMemo(() => {
    const counters: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.URGENT]: 0,
    };

    tasks.forEach((task) => {
      counters[task.priority] += 1;
    });

    return counters;
  }, [tasks]);

  const completionRate = tasks.length
    ? Math.round((byStatus[TaskStatus.COMPLETED] / tasks.length) * 100)
    : 0;

  const overdueCount = tasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }

    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED) {
      return false;
    }

    return new Date(task.dueDate).getTime() < Date.now();
  }).length;

  const teamWorkload = useMemo(() => {
    const countsByTeamId = new Map<string, number>();

    tasks.forEach((task) => {
      const currentCount = countsByTeamId.get(task.teamId) ?? 0;
      countsByTeamId.set(task.teamId, currentCount + 1);
    });

    const byTeam = teams.map((team) => ({
      name: team.name,
      value: countsByTeamId.get(team.id) ?? 0,
    }));

    return byTeam
      .sort((left, right) => right.value - left.value)
      .slice(0, 6);
  }, [tasks, teams]);

  const statusChartData = {
    labels: STATUS_ORDER.map((status) => getStatusLabel(status)),
    datasets: [
      {
        label: 'Tasks',
        data: STATUS_ORDER.map((status) => byStatus[status]),
        backgroundColor: ['#9e9e9e', '#1976d2', '#0288d1', '#2e7d32', '#d32f2f'],
        borderWidth: 0,
      },
    ],
  };

  const priorityChartData = {
    labels: PRIORITY_ORDER.map((priority) => getPriorityLabel(priority)),
    datasets: [
      {
        label: 'Tasks',
        data: PRIORITY_ORDER.map((priority) => byPriority[priority]),
        backgroundColor: ['#9e9e9e', '#0288d1', '#ed6c02', '#d32f2f'],
        borderWidth: 0,
      },
    ],
  };

  const workloadChartData = {
    labels: teamWorkload.map((item) => item.name),
    datasets: [
      {
        label: 'Tasks',
        data: teamWorkload.map((item) => item.value),
        backgroundColor: '#1976d2',
      },
    ],
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Snapshot of task progress, priority distribution, and team workload.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Tasks" value={formatNumber(tasks.length)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Teams" value={formatNumber(teams.length)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Completion Rate" value={`${completionRate}%`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Overdue Tasks" value={formatNumber(overdueCount)} />
        </Grid>
      </Grid>

      {tasks.length === 0 ? (
        <Alert severity="info">No tasks yet. Create tasks to unlock analytics insights.</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Tasks by Status
                </Typography>
                <Doughnut data={statusChartData} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Tasks by Priority
                </Typography>
                <Doughnut data={priorityChartData} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Team Workload (Top 6)
                </Typography>
                {teamWorkload.length === 0 ? (
                  <Alert severity="info">No team workload data yet.</Alert>
                ) : (
                  <Bar
                    data={workloadChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnalyticsPage;
