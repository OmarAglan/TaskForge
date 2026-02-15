import { Box } from '@mui/material';
import React from 'react';

/**
 * Online indicator component - shows a small dot indicating user presence
 */
interface OnlineIndicatorProps {
    isOnline: boolean;
    size?: 'small' | 'medium';
    absolute?: boolean;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
    isOnline,
    size = 'small',
    absolute = false,
}) => {
    const dotSize = size === 'small' ? 8 : 12;

    return (
        <Box
            sx={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                backgroundColor: isOnline ? 'success.main' : 'grey.400',
                border: '2px solid',
                borderColor: 'background.paper',
                position: absolute ? 'absolute' : 'relative',
                bottom: absolute ? 0 : 'auto',
                right: absolute ? 0 : 'auto',
            }}
            title={isOnline ? 'Online' : 'Offline'}
        />
    );
};

export default OnlineIndicator;
