import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { taskSchema, TaskFormData } from '../../utils/validators';
import { Task, TaskStatus, TaskPriority, getStatusLabel, getPriorityLabel } from '../../types/task.types';
import { Team, TeamMember } from '../../types/team.types';
import { getFullName } from '../../types/user.types';

export interface TaskFormProps {
  task?: Task;
  teams: Team[];
  teamMembers?: TeamMember[];
  defaultTeamId?: string;
  onSubmit: (data: TaskFormData) => Promise<void> | void;
  onCancel: () => void;
  onTeamChange?: (teamId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Form component for creating and editing tasks
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  teams,
  teamMembers = [],
  defaultTeamId,
  onSubmit,
  onCancel,
  onTeamChange,
  isLoading = false,
  error,
}) => {
  const isEditMode = !!task;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      teamId: task?.teamId || defaultTeamId || '',
      assigneeId: task?.assigneeId || '',
      priority: task?.priority || TaskPriority.MEDIUM,
      status: task?.status || TaskStatus.TODO,
      dueDate: task?.dueDate?.split('T')[0] || '',
    },
  });

  const selectedTeamId = watch('teamId');

  // Notify parent when team changes
  useEffect(() => {
    if (selectedTeamId && onTeamChange) {
      onTeamChange(selectedTeamId);
    }
  }, [selectedTeamId, onTeamChange]);

  const handleFormSubmit = async (data: TaskFormData) => {
    // Clean up empty strings
    const cleanData = {
      ...data,
      description: data.description || undefined,
      assigneeId: data.assigneeId || undefined,
      dueDate: data.dueDate || undefined,
    };
    await onSubmit(cleanData);
  };

  const loading = isLoading || isSubmitting;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {/* Title */}
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Task Title"
            placeholder="Enter task title"
            fullWidth
            required
            disabled={loading}
            error={!!errors.title}
            helperText={errors.title?.message}
            autoFocus
          />
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            placeholder="Enter task description (optional)"
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
      />

      {/* Team */}
      <Controller
        name="teamId"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth required error={!!errors.teamId} disabled={loading}>
            <InputLabel id="team-select-label">Team</InputLabel>
            <Select
              {...field}
              labelId="team-select-label"
              label="Team"
            >
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
            {errors.teamId && (
              <FormHelperText>{errors.teamId.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Assignee */}
      <Controller
        name="assigneeId"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth disabled={loading || !selectedTeamId}>
            <InputLabel id="assignee-select-label">Assigned To</InputLabel>
            <Select
              {...field}
              labelId="assignee-select-label"
              label="Assigned To"
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.userId}>
                  {member.user ? getFullName(member.user) : 'Unknown User'}
                </MenuItem>
              ))}
            </Select>
            {!selectedTeamId && (
              <FormHelperText>Select a team first</FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Priority and Status Row */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Priority */}
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="priority-select-label">Priority</InputLabel>
              <Select
                {...field}
                labelId="priority-select-label"
                label="Priority"
              >
                {Object.values(TaskPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {getPriorityLabel(priority)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        {/* Status */}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                {...field}
                labelId="status-select-label"
                label="Status"
              >
                {Object.values(TaskStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Box>

      {/* Due Date */}
      <Controller
        name="dueDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="date"
            label="Due Date"
            fullWidth
            disabled={loading}
            error={!!errors.dueDate}
            helperText={errors.dueDate?.message}
            InputLabelProps={{
              shrink: true,
            }}
          />
        )}
      />

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isEditMode ? 'Update Task' : 'Create Task'}
        </Button>
      </Box>
    </Box>
  );
};

export default TaskForm;