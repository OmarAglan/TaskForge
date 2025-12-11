import { zodResolver } from '@hookform/resolvers/zod';
import {
  PersonAdd as RegisterIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';

// Password strength calculator
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.match(/[a-z]/)) strength += 25;
  if (password.match(/[A-Z]/)) strength += 25;
  if (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/)) strength += 25;
  return strength;
};

const getPasswordStrengthLabel = (strength: number): string => {
  if (strength <= 25) return 'Weak';
  if (strength <= 50) return 'Fair';
  if (strength <= 75) return 'Good';
  return 'Strong';
};

const getPasswordStrengthColor = (strength: number): 'error' | 'warning' | 'info' | 'success' => {
  if (strength <= 25) return 'error';
  if (strength <= 50) return 'warning';
  if (strength <= 75) return 'info';
  return 'success';
};

// Validation schema
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[.@$!%*?&#^()_\-+=]/, 'Password must contain at least one special character (.@$!%*?&#^()_-+=)'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password', '');
  const passwordStrength = calculatePasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      navigate('/', { replace: true });
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <RegisterIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join TaskForge and start managing your tasks
              </Typography>
            </Box>

            text

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                {error}
              </Alert>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  {...register('firstName')}
                  label="First Name"
                  fullWidth
                  autoComplete="given-name"
                  autoFocus
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  disabled={isLoading}
                />
                <TextField
                  {...register('lastName')}
                  label="Last Name"
                  fullWidth
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  disabled={isLoading}
                />
              </Box>

              <TextField
                {...register('email')}
                label="Email Address"
                type="email"
                fullWidth
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                sx={{ mb: 2 }}
              />

              <TextField
                {...register('password')}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={showPassword ? 'hide password' : 'show password'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />

              {/* Password Strength Indicator */}
              {password && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    color={getPasswordStrengthColor(passwordStrength)}
                    sx={{ height: 6, borderRadius: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color={`${getPasswordStrengthColor(passwordStrength)}.main`}>
                    Password strength: {getPasswordStrengthLabel(passwordStrength)}
                  </Typography>
                </Box>
              )}

              <TextField
                {...register('confirmPassword')}
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        aria-label={showConfirmPassword ? 'hide password' : 'show password'}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('acceptTerms')}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link component={RouterLink} to="/terms">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link component={RouterLink} to="/privacy">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {errors.acceptTerms && (
                  <FormHelperText error>{errors.acceptTerms.message}</FormHelperText>
                )}
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 3, py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" fontWeight="medium">
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} TaskForge. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;