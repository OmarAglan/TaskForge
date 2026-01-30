# TaskForge Frontend

A modern React application for the TaskForge team task management system.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client
- **date-fns** - Date utilities
- **Chart.js + react-chartjs-2** - Charts (Phase 9)
- **Socket.io-client** - WebSocket support (Phase 8)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.development
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Other Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api/v1` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:3000` |
| `VITE_APP_NAME` | Application name | `TaskForge` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

## Project Structure

```
frontend/
├── public/                   # Static assets
├── src/
│   ├── api/                  # API client and modules
│   │   ├── client.ts         # Axios instance with interceptors
│   │   ├── auth.api.ts       # Authentication API
│   │   ├── teams.api.ts      # Teams API
│   │   ├── tasks.api.ts      # Tasks API
│   │   └── activity.api.ts   # Activity API
│   │
│   ├── components/           # Reusable components
│   │   ├── common/           # ErrorBoundary, Loading, Route guards
│   │   ├── layout/           # AppLayout, Navbar, Sidebar
│   │   ├── shared/           # ConfirmDialog, EmptyState, SearchBar, DateRangePicker, ToastProvider
│   │   ├── skeletons/        # Skeleton loaders (TeamCardSkeleton, TaskCardSkeleton, TableSkeleton)
│   │   ├── teams/            # Team UI components
│   │   └── tasks/            # Task UI components
│   │
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── useApi.ts
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useConfirm.ts
│   │   ├── useTeams.ts
│   │   └── useTasks.ts
│   │
│   ├── pages/                # Route pages
│   │   ├── auth/             # Login, Register
│   │   ├── dashboard/        # Dashboard
│   │   ├── teams/            # Teams pages
│   │   ├── tasks/            # Tasks pages (list/board/detail/my)
│   │   ├── NotFoundPage.tsx
│   │   └── index.ts          # Pages barrel exports
│   │
│   ├── store/                # Zustand stores
│   │   ├── authStore.ts
│   │   ├── teamStore.ts
│   │   └── taskStore.ts
│   │
│   ├── theme/                # Material-UI theme
│   │   └── index.ts
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── auth.types.ts
│   │   ├── team.types.ts
│   │   ├── task.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── toast.ts          # Toast utilities + store
│   │   └── validators.ts     # Zod validation schemas
│   │
│   ├── App.tsx               # Main app component + routes
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
│
├── .env.example              # Example environment variables
├── .env.development          # Development environment
├── index.html                # HTML template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tsconfig.node.json        # TypeScript config for Vite
└── vite.config.ts            # Vite configuration
```

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

| Alias | Path |
|-------|------|
| `@api/*` | `src/api/*` |
| `@components/*` | `src/components/*` |
| `@contexts/*` | `src/contexts/*` |
| `@hooks/*` | `src/hooks/*` |
| `@pages/*` | `src/pages/*` |
| `@store/*` | `src/store/*` |
| `@types/*` | `src/types/*` |
| `@utils/*` | `src/utils/*` |
| `@theme/*` | `src/theme/*` |

## Authentication

The app uses JWT-based authentication:

1. Tokens are stored in localStorage
2. Access token is automatically added to API requests
3. Refresh token is used to get new access tokens when they expire
4. Users are redirected to login on authentication failure

### Protected Routes

Use the `PrivateRoute` component to protect routes:

```tsx
<Route
  element={
    <PrivateRoute>
      <YourComponent />
    </PrivateRoute>
  }
/>
```

### Public Routes

Use the `PublicRoute` component for auth pages (redirects authenticated users):

```tsx
<Route
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  }
/>
```

## State Management

### Auth Store

```tsx
import { useAuthStore } from '@store/authStore';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

### Team Store

```tsx
import { useTeams } from '@hooks/useTeams';

const { teams, isLoading, loadTeams, createTeam, updateTeam, deleteTeam } = useTeams();
```

### Task Store

```tsx
import { useTasks } from '@hooks/useTasks';

const { tasks, isLoading, loadTasks, loadMyTasks, createTask, updateTask, deleteTask } = useTasks();
```

## API Integration

### Using the API Client

```tsx
import { authApi, teamsApi, tasksApi } from '@api';

// Login
const response = await authApi.login({ email, password });

// Fetch teams
const teams = await teamsApi.getTeams();

// Create task
const task = await tasksApi.createTask({ title, teamId });
```

### Using the useApi Hook

```tsx
import { useApi } from '@hooks/useApi';
import { teamsApi } from '@api';

const { data, isLoading, error, execute } = useApi(teamsApi.getTeams);

useEffect(() => {
  execute();
}, []);
```

## Theming

The app uses a custom Material-UI theme defined in `src/theme/index.ts`.

### Customization

```tsx
import { theme } from '@theme';

// Access theme values
theme.palette.primary.main // '#1976d2'
theme.typography.h1 // { fontSize: '2.5rem', ... }
```

## Form Validation

Use the pre-defined Zod schemas for form validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@utils/validators';

const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

## Teams & Tasks UI (Phase 7)

### Routes

Key routes are defined in [`frontend/src/App.tsx`](frontend/src/App.tsx:1):

- `/teams` → Teams list
- `/teams/:id` → Team details (Overview / Members / Tasks / Activity)
- `/tasks` → All tasks (filters + list view)
- `/tasks/board` → Kanban board view
- `/tasks/my` → My tasks (assigned to current user)
- `/tasks/:id` → Task detail

Navigation is provided via [`frontend/src/components/layout/Sidebar.tsx`](frontend/src/components/layout/Sidebar.tsx:1).

### Teams features

- Teams list with search + create flow (dialog form)
- Team detail page with:
  - Overview stats via [`TeamStats`](frontend/src/components/teams/TeamStats.tsx:1)
  - Members management via [`TeamMembersList`](frontend/src/components/teams/TeamMembersList.tsx:1) and [`AddMemberDialog`](frontend/src/components/teams/AddMemberDialog.tsx:1)
  - Tasks tab integration (team-scoped task views)
- Destructive actions use confirmation dialogs via [`ConfirmDialog`](frontend/src/components/shared/ConfirmDialog.tsx:1)

### Tasks features

- Tasks list with filters via [`TaskFilters`](frontend/src/components/tasks/TaskFilters.tsx:1)
- Task creation/editing via [`TaskDialog`](frontend/src/components/tasks/TaskDialog.tsx:1) + [`TaskForm`](frontend/src/components/tasks/TaskForm.tsx:1)
- Task detail view with status/priority updates
- Board view via [`TaskBoardPage`](frontend/src/pages/tasks/TaskBoardPage.tsx:1) (drag/drop can be enhanced in Phase 8)

### User feedback & loading UX

- Toast notifications via [`toast`](frontend/src/utils/toast.ts:1) rendered by [`ToastProvider`](frontend/src/components/shared/ToastProvider.tsx:1)
- Skeleton loaders via [`frontend/src/components/skeletons/index.ts`](frontend/src/components/skeletons/index.ts:1)

## Development Guidelines

### Code Style

- Use functional components with hooks
- Define prop interfaces for all components
- Use TypeScript strict mode
- Follow React best practices

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `kebab-case.types.ts`
- Styles: `kebab-case.css`

### Imports

- Use path aliases for imports
- Group imports: external, internal, relative
- Use barrel exports (`index.ts`)

### Error Handling

- Use try-catch for async operations
- Display user-friendly error messages
- Log errors in development mode

## Implementation Status

- [x] Phase 6: Frontend Foundation
  - [x] Project setup (Vite + React + TypeScript)
  - [x] Material-UI theme
  - [x] API client with interceptors
  - [x] Zustand stores
  - [x] Authentication (Login/Register)
  - [x] Layout components

- [x] Phase 7: Teams and Tasks UI
  - [x] Teams list + create/edit/delete flows
  - [x] Team detail (tabs) + member management
  - [x] Tasks list + filters + pagination controls (UI)
  - [x] My Tasks view
  - [x] Task board view
  - [x] Task detail view + quick status/priority updates
  - [x] Shared UX: confirm dialogs, empty states, search, toast notifications, skeleton loaders

- [ ] Phase 8: Real-time Features
- [ ] Phase 9: Analytics Dashboard

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure backend is running on port 3000
   - Check `VITE_API_URL` in `.env.development`

2. **Authentication Issues**
   - Clear localStorage and try again
   - Check if tokens are being set correctly

3. **Build Errors**
   - Run `npm run type-check` to find type errors
   - Check for missing dependencies

### Development Server Issues

If the development server doesn't start:

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Contributing

1. Create a feature branch
2. Make changes following the code style
3. Test thoroughly
4. Submit a pull request

## License

MIT