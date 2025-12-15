import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (range: DateRange) => void;
  startLabel?: string;
  endLabel?: string;
  minDate?: string;
  maxDate?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

/**
 * Date range picker component using two date inputs
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  minDate,
  maxDate,
  size = 'small',
  disabled = false,
  error = false,
  helperText,
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value || null;
    onChange({
      startDate: newStartDate,
      endDate: endDate,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value || null;
    onChange({
      startDate: startDate,
      endDate: newEndDate,
    });
  };

  // Get max date for start input (either end date or provided maxDate)
  const getStartMaxDate = () => {
    if (endDate && maxDate) {
      return endDate < maxDate ? endDate : maxDate;
    }
    return endDate || maxDate;
  };

  // Get min date for end input (either start date or provided minDate)
  const getEndMinDate = () => {
    if (startDate && minDate) {
      return startDate > minDate ? startDate : minDate;
    }
    return startDate || minDate;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          type="date"
          label={startLabel}
          value={startDate || ''}
          onChange={handleStartDateChange}
          size={size}
          disabled={disabled}
          error={error}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: minDate,
            max: getStartMaxDate(),
          }}
          sx={{ minWidth: 150 }}
        />
        <Typography variant="body2" color="text.secondary">
          to
        </Typography>
        <TextField
          type="date"
          label={endLabel}
          value={endDate || ''}
          onChange={handleEndDateChange}
          size={size}
          disabled={disabled}
          error={error}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: getEndMinDate(),
            max: maxDate,
          }}
          sx={{ minWidth: 150 }}
        />
      </Box>
      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 0.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Format date to display format
 */
export const formatDateDisplay = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

/**
 * Format date to input value format (YYYY-MM-DD)
 */
export const formatDateInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export default DateRangePicker;