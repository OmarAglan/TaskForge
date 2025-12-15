import React from 'react';
import { Box, Typography, Button, SvgIconProps } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

export interface EmptyStateProps {
  icon?: React.ReactElement<SvgIconProps>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Generic empty state component for when there's no data to display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'contained',
  size = 'medium',
}) => {
  const iconSize = {
    small: 48,
    medium: 64,
    large: 80,
  }[size];

  const titleVariant = {
    small: 'subtitle1' as const,
    medium: 'h6' as const,
    large: 'h5' as const,
  }[size];

  const padding = {
    small: 3,
    medium: 4,
    large: 6,
  }[size];

  const defaultIcon = <InboxIcon sx={{ fontSize: iconSize, color: 'text.secondary' }} />;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: padding,
        px: 2,
      }}
    >
      <Box
        sx={{
          mb: 2,
          opacity: 0.6,
        }}
      >
        {icon ? React.cloneElement(icon, { sx: { fontSize: iconSize, color: 'text.secondary' } }) : defaultIcon}
      </Box>
      <Typography
        variant={titleVariant}
        color="text.primary"
        fontWeight="medium"
        gutterBottom
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400, mb: actionLabel ? 3 : 0 }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant={actionVariant}
          color="primary"
          onClick={onAction}
          size={size === 'small' ? 'small' : 'medium'}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;