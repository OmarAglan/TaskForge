# TaskForge Frontend Component Library (Phase 7)

This document describes the Teams & Tasks UI component library for TaskForge, including props and usage examples.

> Conventions:
> - Components live under `frontend/src/components/*`
> - Pages live under `frontend/src/pages/*`
> - Prefer importing from barrel exports where possible (`@components`, `@pages`)

---

## Shared Components (`src/components/shared/`)

### ConfirmDialog

**File:** `frontend/src/components/shared/ConfirmDialog.tsx`

Reusable confirmation dialog for destructive actions.

**Props:**
- `open: boolean`
- `title: string`
- `message: React.ReactNode`
- `onConfirm: () => void | Promise<void>`
- `onCancel: () => void`
- `confirmText?: string`
- `cancelText?: string`
- `loading?: boolean`

**Example:**
```tsx
import React, { useState } from 'react';
import { Button } from '@mui/material';
import { ConfirmDialog } from '@components';

export function DeleteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button color="error" onClick={() => setOpen(true)}>
        Delete
      </Button>

      <ConfirmDialog
        open={open}
        title="Delete item"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          // await api.delete(...)
          setOpen(false);
        }}
      />
    </>
  );
}
```

---

### EmptyState

**File:** `frontend/src/components/shared/EmptyState.tsx`

Generic empty state UI with optional action.

**Props:**
- `icon?: React.ReactNode`
- `title: string`
- `description?: string`
- `actionLabel?: string`
- `onAction?: () => void`

**Example:**
```tsx
import { EmptyState } from '@components';
import { Group as TeamIcon } from '@mui/icons-material';

<EmptyState
  icon={<TeamIcon />}
  title="No teams yet"
  description="Create your first team to start collaborating."
  actionLabel="Create Team"
  onAction={() => setCreateOpen(true)}
/>;
```

---

### SearchBar

**File:** `frontend/src/components/shared/SearchBar.tsx`

Debounced search input with clear button.

**Props:**
- `value: string`
- `onChange: (value: string) => void`
- `placeholder?: string`
- `debounceMs?: number`

**Example:**
```tsx
import { SearchBar } from '@components';

<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Search teams..."
  debounceMs={300}
/>;
```

---

### DateRangePicker

**File:** `frontend/src/components/shared/DateRangePicker.tsx`

Simple date-range selection UI used by task filters.

**Props:**
- `startDate?: string | null`
- `endDate?: string | null`
- `onChange: (range: { startDate?: string | null; endDate?: string | null }) => void`

---

### ToastProvider

**File:** `frontend/src/components/shared/ToastProvider.tsx`

Renders toast notifications from the toast store.

**Usage:**
Mounted once in the app root (see `frontend/src/App.tsx`).

---

## Skeleton Components (`src/components/skeletons/`)

### TeamCardSkeleton

**File:** `frontend/src/components/skeletons/TeamCardSkeleton.tsx`

Used while loading team list views.

---

### TaskCardSkeleton

**File:** `frontend/src/components/skeletons/TaskCardSkeleton.tsx`

Used while loading task list views.

---

### TableSkeleton

**File:** `frontend/src/components/skeletons/TableSkeleton.tsx`

Used while loading table-based lists (members list, etc.)

---

## Teams Components (`src/components/teams/`)

### MemberRoleChip

**File:** `frontend/src/components/teams/MemberRoleChip.tsx`

Role chip (OWNER/ADMIN/MEMBER) with consistent colors.

**Props:**
- `role: TeamRole`

---

### TeamCard

**File:** `frontend/src/components/teams/TeamCard.tsx`

Card UI for team list/grid.

**Props:**
- `team: Team`
- `onView: (team: Team) => void`
- `onEdit?: (team: Team) => void`
- `onDelete?: (team: Team) => void`

---

### TeamForm

**File:** `frontend/src/components/teams/TeamForm.tsx`

React Hook Form + Zod validated form used for create & edit.

**Props:**
- `team?: Team` (edit mode)
- `onSubmit: (dto: CreateTeamDto | UpdateTeamDto) => Promise<Team>`
- `onCancel: () => void`

---

### TeamDialog

**File:** `frontend/src/components/teams/TeamDialog.tsx`

Dialog wrapper for `TeamForm`.

**Props:**
- `open: boolean`
- `team?: Team`
- `onClose: () => void`
- `onSuccess: (team: Team) => void`
- `onSubmit: (dto: CreateTeamDto | UpdateTeamDto) => Promise<Team>`

---

### TeamMembersList

**File:** `frontend/src/components/teams/TeamMembersList.tsx`

Members management list/table with role controls for owners/admins.

**Props:**
- `teamId: string`

---

### AddMemberDialog

**File:** `frontend/src/components/teams/AddMemberDialog.tsx`

Dialog for selecting a user and adding them to a team.

**Props:**
- `teamId: string`
- `open: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

---

### TeamStats

**File:** `frontend/src/components/teams/TeamStats.tsx`

Stats cards for a team (total tasks / completed / in progress / members).

**Props:**
- `teamId: string`

---

## Tasks Components (`src/components/tasks/`)

### TaskPriorityChip

**File:** `frontend/src/components/tasks/TaskPriorityChip.tsx`

Displays task priority as a color-coded chip.

**Props:**
- `priority: TaskPriority`

---

### TaskStatusChip

**File:** `frontend/src/components/tasks/TaskStatusChip.tsx`

Displays task status as a color-coded chip.

**Props:**
- `status: TaskStatus`

---

### TaskAssigneeAvatar

**File:** `frontend/src/components/tasks/TaskAssigneeAvatar.tsx`

Assignee avatar with tooltip.

**Props:**
- `user?: User`
- `onReassign?: () => void`

---

### TaskDueDateBadge

**File:** `frontend/src/components/tasks/TaskDueDateBadge.tsx`

Displays due date (overdue/due soon/normal styles) and relative time.

**Props:**
- `dueDate: string`

---

### TaskCard

**File:** `frontend/src/components/tasks/TaskCard.tsx`

Compact card used for list view and board columns.

**Props:**
- `task: Task`
- `onClick: (task: Task) => void`
- `onEdit?: (task: Task) => void`
- `onDelete?: (task: Task) => void`
- `onStatusChange?: (task: Task, status: TaskStatus) => void`

---

### TaskStatusSelect

**File:** `frontend/src/components/tasks/TaskStatusSelect.tsx`

Dropdown for updating a task status.

**Props:**
- `taskId: string`
- `currentStatus: TaskStatus`
- `onChange: (status: TaskStatus) => Promise<void> | void`

---

### TaskFilters

**File:** `frontend/src/components/tasks/TaskFilters.tsx`

Filter controls for tasks list pages.

**Props:**
- `filters: FilterTasksDto`
- `onChange: (filters: FilterTasksDto) => void`
- `teams?: Team[]`
- `assignees?: User[]`

---

### TaskForm

**File:** `frontend/src/components/tasks/TaskForm.tsx`

React Hook Form + Zod validated form for create/edit task.

**Props:**
- `task?: Task`
- `defaultTeamId?: string`
- `teams: Team[]`
- `teamMembers?: TeamMember[]`
- `loadingMembers?: boolean`
- `onLoadTeamMembers?: (teamId: string) => Promise<TeamMember[]>`
- `onSubmit: (dto: CreateTaskDto | UpdateTaskDto) => Promise<Task>`
- `onCancel: () => void`

---

### TaskDialog

**File:** `frontend/src/components/tasks/TaskDialog.tsx`

Dialog wrapper around `TaskForm`.

**Props:**
- `open: boolean`
- `task?: Task`
- `teamId?: string`
- `teams: Team[]`
- `onClose: () => void`
- `onSuccess: (task: Task) => void`
- `onSubmit: (dto: CreateTaskDto | UpdateTaskDto) => Promise<Task>`
- `onLoadTeamMembers?: (teamId: string) => Promise<TeamMember[]>`

---

### TaskList

**File:** `frontend/src/components/tasks/TaskList.tsx`

Task list renderer (supports skeleton/empty state and performance-oriented list behavior).

**Props:**
- `tasks: Task[]`
- `loading: boolean`
- `onTaskClick: (task: Task) => void`
- `onTaskEdit?: (task: Task) => void`
- `onTaskDelete?: (task: Task) => void`

---

## Hooks (used by the UI)

These are not UI components, but are critical to the UI:

- `frontend/src/hooks/useTeams.ts` — teams store access & actions
- `frontend/src/hooks/useTasks.ts` — tasks store access & actions
- `frontend/src/hooks/useDebounce.ts` — debounced values for search/filtering
- `frontend/src/hooks/useConfirm.ts` — confirm dialog helper hook

---

## Utilities (used by the UI)

- `frontend/src/utils/validators.ts` — Zod schemas for Teams/Tasks forms
- `frontend/src/utils/toast.ts` — toast store + `toast.success/error/info`