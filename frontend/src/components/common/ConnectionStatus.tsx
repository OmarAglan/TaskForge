import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { FiberManualRecord as OnlineIcon } from '@mui/icons-material';
import { useWebSocket } from '../../hooks/useWebSocket';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

interface ConnectionStatusProps {
  showLabel?: boolean;
  size?: 'small' | 'medium';
}

/**
 * ConnectionStatus component - displays WebSocket connection status indicator
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showLabel = false,
  size = 'small',
}) => {
  const { connectionState } = useWebSocket();

  const getColor = (): 'success' | 'warning' | 'error' => {
    switch (connectionState) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getLabel = (): string => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Disconnected';
    }
  };

  const iconSize = size === 'small' ? 8 : 12;

  return (
    <Tooltip title={getLabel()}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <OnlineIcon
          sx={{
            fontSize: iconSize,
            color: `${getColor()}.main`,
            animation: connectionState === 'connecting' ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        />
        {showLabel && (
          <Box
            component="span"
            sx={{
              fontSize: size === 'small' ? '0.75rem' : '0.875rem',
              color: `${getColor()}.main`,
            }}
          >
            {getLabel()}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default ConnectionStatus;
