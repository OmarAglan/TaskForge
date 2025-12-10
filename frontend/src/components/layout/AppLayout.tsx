import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 260;

interface AppLayoutProps {
  children?: React.ReactNode;
}

/**
 * Main application layout with navbar and sidebar
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar onMenuClick={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} />

      {/* Sidebar */}
      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerClose}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for fixed navbar */}
        <Box sx={{ p: 3 }}>
          {/* Render children or Outlet for nested routes */}
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;