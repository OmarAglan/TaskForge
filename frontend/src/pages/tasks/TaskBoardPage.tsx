import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TaskDialog, TaskPriorityChip, TaskAssigneeAvatar, TaskDueDateBadge } from '../../components/tasks';
import { ConfirmDialog } from '../../components/shared';
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { Task, TaskStatus, getStatusLabel, CreateTaskDto, UpdateTaskDto } from '../../types/task.types';
import { TeamMember } from '../../types/team.types';
import { toast } from '../../utils/toast';
import * as teamsApi from '../../api/teams.api';

const statusColumns: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.COMPLETED,
];

const getColumnColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return '#757575';
    case TaskStatus.IN_PROGRESS:
      return '#1976d2';
    case TaskStatus.IN_REVIEW:
      return '#9c27b0';
    case TaskStatus.COMPLETED:
      return '#2e7d32';
    default:
      return '#757575';
  }
};

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  status,
  tasks,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onAddTask,
}) => {
  const color = getColumnColor(status);

  return (
    <Paper
      sx={{
        flex: '1 1 280px',
        minWidth: 280,
        maxWidth: 350,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.50',
        borderRadius: 2,
        overflow: 'hidden',
      }}
      elevation={0}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '3px solid',
          borderColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {getStatusLabel(status)}
          </Typography>
          <Chip label={tasks.length} size="small" sx={{ bgcolor: color, color: 'white' }} />
        </Box>
        <IconButton size="small" onClick={() => onAddTask(status)}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Column Content */}
      <Box
        sx={{
          p: 1,
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {tasks.map((task) => (
          <BoardCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
          />
        ))}
        {tasks.length === 0 && (
          <Box
            sx={{
              p: 2,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">No tasks</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

interface BoardCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
  task,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 3,
        },
      }}
      onClick={() => onTaskClick(task)}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <TaskPriorityChip priority={task.priority} />
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          fontWeight={500}
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <TaskAssigneeAvatar user={task.assignee} size="small" />
          {task.dueDate && <TaskDueDateBadge dueDate={task.dueDate} />}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => { handleMenuClose(); onTaskClick(task); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); onTaskEdit(task); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); onTaskDelete(task); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

/**
 * Kanban board view for tasks
 */
export const TaskBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    tasks,
    isLoading,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const { teams, loadTeams } = useTeams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTeams();
    loadTasks({ limit: 100 }); // Load all tasks for board view
  }, []);

  // Group tasks by status
  const tasksByStatus = statusColumns.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleTaskClick = useCallback((task: Task) => {
    navigate(`/tasks/${task.id}`);
  }, [navigate]);

  const handleTaskEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setDefaultStatus(undefined);
    setDialogOpen(true);
  }, []);

  const handleTaskDelete = useCallback((task: Task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  }, []);

  const handleAddTask = useCallback((status: TaskStatus) => {
    setEditingTask(undefined);
    setDefaultStatus(status);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTask(undefined);
    setDefaultStatus(undefined);
  };

  const handleDialogSuccess = () => {
    handleDialogClose();
    loadTasks({ limit: 100 });
    toast.success(editingTask ? 'Task updated successfully' : 'Task created successfully');
  };

  const handleSubmit = async (data: CreateTaskDto | UpdateTaskDto): Promise<Task> => {
    if (editingTask) {
      return await updateTask(editingTask.id, data as UpdateTaskDto);
    } else {
      const createData = {
        ...data,
        status: defaultStatus || TaskStatus.TODO,
      } as CreateTaskDto;
      return await createTask(createData);
    }
  };

  const handleLoadTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    return await teamsApi.getTeamMembers(teamId);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      toast.success('Task deleted successfully');
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Task Board
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddTask(TaskStatus.TODO)}
        >
          Create Task
        </Button>
      </Box>

      {/* Board */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
        }}
      >
        {statusColumns.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
            onTaskClick={handleTaskClick}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
            onAddTask={handleAddTask}
          />
        ))}
      </Box>

      {/* Create/Edit Dialog */}
      <TaskDialog
        open={dialogOpen}
        task={editingTask}
        teams={teams}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        onSubmit={handleSubmit}
        onLoadTeamMembers={handleLoadTeamMembers}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Task"
        message={
          <>
            Are you sure you want to delete <strong>{taskToDelete?.title}</strong>?
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        isLoading={isDeleting}
        showWarningIcon
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setTaskToDelete(null); }}
      />
    </Box>
  );
};

export default TaskBoardPage;