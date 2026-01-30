import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Autocomplete,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { TeamRole, AddMemberDto } from '../../types/team.types';
import { UserSummary, getFullName, getInitials } from '../../types/user.types';

export interface AddMemberDialogProps {
  open: boolean;
  teamId: string;
  availableUsers: UserSummary[];
  isLoadingUsers?: boolean;
  onClose: () => void;
  onAdd: (data: AddMemberDto) => Promise<void>;
  onSearchUsers?: (query: string) => void;
}

/**
 * Dialog component for adding new members to a team
 */
export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  teamId: _teamId,
  availableUsers,
  isLoadingUsers = false,
  onClose,
  onAdd,
  onSearchUsers,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [role, setRole] = useState<TeamRole>(TeamRole.MEMBER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const handleClose = () => {
    if (!isLoading) {
      setSelectedUser(null);
      setRole(TeamRole.MEMBER);
      setError(null);
      setSearchInput('');
      onClose();
    }
  };

  const handleAdd = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onAdd({
        userId: selectedUser.id,
        role: role,
      });
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add member';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    onSearchUsers?.(value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-member-dialog-title"
    >
      <DialogTitle id="add-member-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            Add Team Member
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Autocomplete
            value={selectedUser}
            onChange={(_, newValue) => setSelectedUser(newValue)}
            inputValue={searchInput}
            onInputChange={(_, newInputValue) => handleSearchChange(newInputValue)}
            options={availableUsers}
            loading={isLoadingUsers}
            getOptionLabel={(option) => getFullName(option)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search User"
                placeholder="Type to search users..."
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <ListItem {...props} key={option.id}>
                <ListItemAvatar>
                  <Avatar src={option.avatarUrl} sx={{ width: 32, height: 32 }}>
                    {getInitials(option)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={getFullName(option)}
                  secondary={option.email}
                />
              </ListItem>
            )}
            noOptionsText="No users found"
            disabled={isLoading}
          />

          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as TeamRole)}
              disabled={isLoading}
            >
              <MenuItem value={TeamRole.MEMBER}>
                <Box>
                  <Typography variant="body2">Member</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Can view and work on tasks
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value={TeamRole.ADMIN}>
                <Box>
                  <Typography variant="body2">Admin</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Can manage team members and settings
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary">
            Note: Only the team owner can transfer ownership. New members will receive an invitation notification.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={isLoading || !selectedUser}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Add Member
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;