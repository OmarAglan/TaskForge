import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Team, CreateTeamDto, UpdateTeamDto } from '../../types/team.types';
import { TeamForm } from './TeamForm';
import { TeamFormData } from '../../utils/validators';

export interface TeamDialogProps {
  open: boolean;
  team?: Team;
  onClose: () => void;
  onSuccess: (team: Team) => void;
  onSubmit: (data: CreateTeamDto | UpdateTeamDto) => Promise<Team>;
}

/**
 * Dialog component for creating and editing teams
 */
export const TeamDialog: React.FC<TeamDialogProps> = ({
  open,
  team,
  onClose,
  onSuccess,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!team;
  const title = isEditMode ? 'Edit Team' : 'Create Team';

  const handleSubmit = async (data: TeamFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await onSubmit(data);
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
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="team-dialog-title"
    >
      <DialogTitle id="team-dialog-title">
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
        <TeamForm
          team={team}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isLoading={isLoading}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TeamDialog;