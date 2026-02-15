import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { CreateTaskDto, Task, UpdateTaskDto } from '../../types/task.types';
import { Team, TeamMember } from '../../types/team.types';
import { TaskFormData } from '../../utils/validators';
import { TaskForm } from './TaskForm';

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

  // Track current team ID to prevent duplicate API calls
  const currentTeamIdRef = useRef<string | null>(null);

  // Load team members when team changes
  const handleTeamChange = async (teamId: string) => {
    if (!onLoadTeamMembers) return;
    
    // Skip if same team is selected
    if (currentTeamIdRef.current === teamId) return;
    currentTeamIdRef.current = teamId;

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

  // Load initial team members when dialog opens
  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setTeamMembers([]);
      currentTeamIdRef.current = null;
      
      const teamId = task?.teamId || defaultTeamId;
      if (teamId && onLoadTeamMembers) {
        currentTeamIdRef.current = teamId;
        setLoadingMembers(true);
        onLoadTeamMembers(teamId)
          .then((members) => setTeamMembers(members))
          .catch(() => setTeamMembers([]))
          .finally(() => setLoadingMembers(false));
      }
    } else {
      // Cleanup when dialog closes
      setTeamMembers([]);
      setError(null);
    }
  }, [open, task?.teamId, defaultTeamId, onLoadTeamMembers]);

  const handleSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const submitData = {
        title: data.title,
        description: data.description || undefined,
        teamId: data.teamId,
        assigneeId: data.assigneeId || undefined,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate || undefined,
      } as CreateTaskDto | UpdateTaskDto;

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