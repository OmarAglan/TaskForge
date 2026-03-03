import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as authApi from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { UpdateUserDto } from '../../types/user.types';
import { UpdateProfileFormData, updateProfileSchema } from '../../utils/validators';
import { toast } from '../../utils/toast';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl ?? '',
    });
  }, [user, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      const payload: UpdateUserDto = {
        firstName: data.firstName?.trim() || undefined,
        lastName: data.lastName?.trim() || undefined,
        avatarUrl: data.avatarUrl?.trim() || undefined,
      };

      const updatedUser = await authApi.updateProfile(payload);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and public avatar.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={user.avatarUrl}
                sx={{ width: 96, height: 96, bgcolor: 'primary.main' }}
              >
                {user.firstName.charAt(0)}
              </Avatar>
              <Typography variant="h6">{`${user.firstName} ${user.lastName}`}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Role: {user.role}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Edit Profile
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="First Name"
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Last Name"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Controller
                  name="avatarUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Avatar URL"
                      placeholder="https://example.com/avatar.png"
                      error={!!errors.avatarUrl}
                      helperText={errors.avatarUrl?.message}
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
                    Save Changes
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
