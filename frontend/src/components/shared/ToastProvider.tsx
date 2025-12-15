import { Close as CloseIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, IconButton, Snackbar } from '@mui/material';
import React, { useEffect } from 'react';
import { ToastMessage, useToastStore } from '../../utils/toast';

/**

Individual toast notification component
*/
const Toast: React.FC<{
    toast: ToastMessage;
    onClose: () => void;
}> = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(onClose, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onClose]);
    return (
        <Alert
            severity={toast.severity}
            variant="filled"
            onClose={onClose}
            action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {toast.action && (
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                                toast.action?.onClick();
                                onClose();
                            }}
                            sx={{ fontWeight: 600 }}
                        >
                            {toast.action.label}
                        </Button>
                    )}
                    <IconButton size="small" color="inherit" onClick={onClose} aria-label="close" >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            }
            sx={{
                minWidth: 300,
                maxWidth: 500,
                boxShadow: 3,
                '& .MuiAlert-message': {
                    flex: 1,
                },
            }}
        >
            {toast.message}
        </Alert>
    );
};

/**

Toast provider component - renders all active toast notifications
*/
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toasts, removeToast } = useToastStore();
    return (
        <>
            {children}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: 1,
                }}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </Box>
        </>
    );
};

export default ToastProvider;