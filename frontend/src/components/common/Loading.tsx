import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  /**
   * Size of the loading spinner
   */
  size?: number;
  /**
   * Optional text to display below the spinner
   */
  text?: string;
  /**
   * Whether to center the spinner in the full screen
   */
  fullScreen?: boolean;
  /**
   * Optional color for the spinner
   */
  color?: 'primary' | 'secondary' | 'inherit';
}

/**
 * Loading spinner component
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 40,
  text,
  fullScreen = false,
  color = 'primary',
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <CircularProgress size={size} color={color} />
      {text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        width="100%"
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding={4}
    >
      {content}
    </Box>
  );
};

export default Loading;