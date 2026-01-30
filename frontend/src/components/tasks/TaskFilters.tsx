import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  TextField,
  InputAdornment,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { TaskStatus, TaskPriority, FilterTasksDto, getStatusLabel, getPriorityLabel } from '../../types/task.types';
import { Team } from '../../types/team.types';
// DateRangePicker removed - not currently used

export interface TaskFiltersProps {
  filters: FilterTasksDto;
  onChange: (filters: FilterTasksDto) => void;
  teams?: Team[];
  showTeamFilter?: boolean;
  showAssigneeFilter?: boolean;
  compact?: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const statusOptions = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.COMPLETED,
  TaskStatus.CANCELLED,
];

const priorityOptions = [
  TaskPriority.URGENT,
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
];

/**
 * Task filter controls component
 */
export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onChange,
  teams = [],
  showTeamFilter = true,
  showAssigneeFilter: _showAssigneeFilter = false,
  compact = false,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: event.target.value });
  };

  const handleStatusChange = (event: SelectChangeEvent<TaskStatus[]>) => {
    const value = event.target.value;
    const statuses = typeof value === 'string' ? [value as TaskStatus] : value;
    onChange({ ...filters, status: statuses.length === 1 ? statuses[0] : undefined });
  };

  const handlePriorityChange = (event: SelectChangeEvent<TaskPriority[]>) => {
    const value = event.target.value;
    const priorities = typeof value === 'string' ? [value as TaskPriority] : value;
    onChange({ ...filters, priority: priorities.length === 1 ? priorities[0] : undefined });
  };

  const handleTeamChange = (event: SelectChangeEvent<string>) => {
    onChange({ ...filters, teamId: event.target.value || undefined });
  };

  // handleDateRangeChange removed - not currently used

  const handleClearFilters = () => {
    onChange({
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.teamId ||
    filters.assigneeId
  );

  const selectedStatuses = filters.status ? [filters.status] : [];
  const selectedPriorities = filters.priority ? [filters.priority] : [];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: compact ? 'center' : 'stretch',
      }}
    >
      {/* Search */}
      <TextField
        placeholder="Search tasks..."
        value={filters.search || ''}
        onChange={handleSearchChange}
        size="small"
        sx={{ minWidth: 200, flex: compact ? '1 1 auto' : undefined }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: filters.search ? (
            <InputAdornment position="end">
              <ClearIcon
                fontSize="small"
                sx={{ cursor: 'pointer' }}
                onClick={() => onChange({ ...filters, search: undefined })}
              />
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Status Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          multiple
          value={selectedStatuses}
          onChange={handleStatusChange}
          input={<OutlinedInput label="Status" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((status) => (
                <Chip key={status} label={getStatusLabel(status)} size="small" />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              <Checkbox checked={selectedStatuses.includes(status)} />
              <ListItemText primary={getStatusLabel(status)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Priority Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="priority-filter-label">Priority</InputLabel>
        <Select
          labelId="priority-filter-label"
          multiple
          value={selectedPriorities}
          onChange={handlePriorityChange}
          input={<OutlinedInput label="Priority" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((priority) => (
                <Chip key={priority} label={getPriorityLabel(priority)} size="small" />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {priorityOptions.map((priority) => (
            <MenuItem key={priority} value={priority}>
              <Checkbox checked={selectedPriorities.includes(priority)} />
              <ListItemText primary={getPriorityLabel(priority)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Team Filter */}
      {showTeamFilter && teams.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="team-filter-label">Team</InputLabel>
          <Select
            labelId="team-filter-label"
            value={filters.teamId || ''}
            onChange={handleTeamChange}
            label="Team"
          >
            <MenuItem value="">
              <em>All Teams</em>
            </MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );
};

export default TaskFilters;