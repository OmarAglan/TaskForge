import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { ChangePasswordFormData, changePasswordSchema } from '../../utils/validators';
import { toast } from '../../utils/toast';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      reset();
    } catch {
      toast.error('Failed to change password');
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update your password and manage your current session.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Change Password
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <Controller
                  name="currentPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Current Password"
                      error={!!errors.currentPassword}
                      helperText={errors.currentPassword?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />

                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="New Password"
                      error={!!errors.newPassword}
                      helperText={errors.newPassword?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />

                <Controller
                  name="confirmNewPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      error={!!errors.confirmNewPassword}
                      helperText={errors.confirmNewPassword?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                  >
                    Update Password
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Session
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Signed in as {user?.email}
              </Typography>
              <Button fullWidth variant="outlined" color="error" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
