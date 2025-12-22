import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { TaskStatus, getStatusLabel } from '../../types/task.types';

export interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
  onChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  disabled?: boolean;
  size?: 'small' | 'medium';
  confirmMajorChanges?: boolean;
}

/**
 * Get status chip styles based on status
 */
const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return '#757575';
    case TaskStatus.IN_PROGRESS:
      return '#1976d2';
    case TaskStatus.IN_REVIEW:
      return '#9c27b0';
    case TaskStatus.COMPLETED:
      return '#2e7d32';
    case TaskStatus.CANCELLED:
      return '#424242';
    default:
      return '#757575';
  }
};

/**
 * Check if a status change is considered "major"
 */
const isMajorChange = (from: TaskStatus, to: TaskStatus): boolean => {
  // Major changes: skipping status or going from TODO directly to COMPLETED
  if (from === TaskStatus.TODO && to === TaskStatus.COMPLETED) return true;
  if (from === TaskStatus.TODO && to === TaskStatus.IN_REVIEW) return true;
  // Going backwards is also major
  if (from === TaskStatus.COMPLETED && to === TaskStatus.TODO) return true;
  return false;
};

/**
 * Dropdown component for changing task status
 */
export const TaskStatusSelect: React.FC<TaskStatusSelectProps> = ({
  taskId,
  currentStatus,
  onChange,
  disabled = false,
  size = 'small',
  confirmMajorChanges = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);

  const handleChange = async (event: SelectChangeEvent<TaskStatus>) => {
    const newStatus = event.target.value as TaskStatus;
    
    if (newStatus === currentStatus) return;

    if (confirmMajorChanges && isMajorChange(currentStatus, newStatus)) {
      setPendingStatus(newStatus);
      setConfirmOpen(true);
      return;
    }

    await executeChange(newStatus);
  };

  const executeChange = async (newStatus: TaskStatus) => {
    setIsLoading(true);
    try {
      await onChange(taskId, newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (pendingStatus) {
      await executeChange(pendingStatus);
    }
    setConfirmOpen(false);
    setPendingStatus(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingStatus(null);
  };

  const statuses = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.COMPLETED,
    TaskStatus.CANCELLED,
  ];

  return (
    <>
      <FormControl size={size} sx={{ minWidth: 140 }}>
        <InputLabel id={`task-status-label-${taskId}`}>Status</InputLabel>
        <Select
          labelId={`task-status-label-${taskId}`}
          id={`task-status-select-${taskId}`}
          value={currentStatus}
          label="Status"
          onChange={handleChange}
          disabled={disabled || isLoading}
        >
          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(status),
                  }}
                />
                <Typography variant="body2">{getStatusLabel(status)}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to change the status from{' '}
            <strong>{getStatusLabel(currentStatus)}</strong> to{' '}
            <strong>{pendingStatus ? getStatusLabel(pendingStatus) : ''}</strong>.
            This is a significant change. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskStatusSelect;