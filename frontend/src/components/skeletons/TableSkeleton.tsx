import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
} from '@mui/material';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  dense?: boolean;
}

/**
 * Skeleton loader for table components
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  showHeader = true,
  dense = false,
}) => {
  const cellHeight = dense ? 36 : 52;

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table size={dense ? 'small' : 'medium'}>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" width="80%" height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex} sx={{ height: cellHeight }}>
                  {colIndex === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="text" width="70%" />
                    </Box>
                  ) : colIndex === columns - 1 ? (
                    <Skeleton variant="rounded" width={60} height={24} />
                  ) : (
                    <Skeleton variant="text" width={`${60 + Math.random() * 30}%`} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Simple list skeleton for non-table lists
 */
export const ListSkeleton: React.FC<{ rows?: number; showAvatar?: boolean }> = ({
  rows = 5,
  showAvatar = true,
}) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: index < rows - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="50%" height={22} />
            <Skeleton variant="text" width="30%" height={18} />
          </Box>
          <Skeleton variant="rounded" width={80} height={28} />
        </Box>
      ))}
    </Box>
  );
};

export default TableSkeleton;