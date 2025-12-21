import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { teamSchema, TeamFormData } from '../../utils/validators';
import { Team } from '../../types/team.types';

export interface TeamFormProps {
  team?: Team;
  onSubmit: (data: TeamFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Form component for creating and editing teams
 */
export const TeamForm: React.FC<TeamFormProps> = ({
  team,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}) => {
  const isEditMode = !!team;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
    },
  });

  const handleFormSubmit = async (data: TeamFormData) => {
    await onSubmit(data);
  };

  const loading = isLoading || isSubmitting;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Team Name"
            placeholder="Enter team name"
            fullWidth
            required
            disabled={loading}
            error={!!errors.name}
            helperText={errors.name?.message}
            autoFocus
            inputProps={{
              'aria-label': 'Team name',
            }}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            placeholder="Enter team description (optional)"
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            error={!!errors.description}
            helperText={errors.description?.message}
            inputProps={{
              'aria-label': 'Team description',
            }}
          />
        )}
      />

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
          {isEditMode ? 'Update Team' : 'Create Team'}
        </Button>
      </Box>
    </Box>
  );
};

export default TeamForm;