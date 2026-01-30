import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Task, CreateTaskDto, UpdateTaskDto, TaskPriority, TaskStatus } from '../../types/task.types';
import { Team, TeamMember } from '../../types/team.types';
import { TaskForm } from './TaskForm';
import { TaskFormData } from '../../utils/validators';

export interface TaskDialogProps {
  open: boolean;
  task?: Task;
  teams: Team[];
  defaultTeamId?: string;
  onClose: () => void;
  onSuccess: (task: Task) => void;
  onSubmit: (data: CreateTaskDto | UpdateTaskDto) => Promise<Task>;
  onLoadTeamMembers?: (teamId: string) => Promise<TeamMember[]>;
}

/**
 * Dialog component for creating and editing tasks
 */
export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  task,
  teams,
  defaultTeamId,
  onClose,
  onSuccess,
  onSubmit,
  onLoadTeamMembers,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const isEditMode = !!task;
  const title = isEditMode ? 'Edit Task' : 'Create Task';

  // Load team members when team changes
  const handleTeamChange = async (teamId: string) => {
    if (!onLoadTeamMembers) return;

    setLoadingMembers(true);
    try {
      const members = await onLoadTeamMembers(teamId);
      setTeamMembers(members);
    } catch (err) {
      console.error('Failed to load team members:', err);
      setTeamMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Load initial team members if editing or default team
  useEffect(() => {
    const teamId = task?.teamId || defaultTeamId;
    if (open && teamId && onLoadTeamMembers) {
      handleTeamChange(teamId);
    }
  }, [open, task?.teamId, defaultTeamId]);

  const handleSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const submitData: CreateTaskDto | UpdateTaskDto = {
        title: data.title,
        description: data.description || undefined,
        teamId: data.teamId,
        assigneeId: data.assigneeId || undefined,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate || undefined,
      };

      const result = await onSubmit(submitData);
      onSuccess(result);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setTeamMembers([]);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="task-dialog-title"
    >
      <DialogTitle id="task-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={isLoading}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <TaskForm
          task={task}
          teams={teams}
          teamMembers={teamMembers}
          defaultTeamId={defaultTeamId}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          onTeamChange={handleTeamChange}
          isLoading={isLoading || loadingMembers}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;