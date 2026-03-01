# AGENTS.md - TaskForge Development Guide

## Project Overview

TaskForge is a full-stack project management application with:
- **Backend**: NestJS + TypeORM + PostgreSQL + JWT + WebSockets
- **Frontend**: React + Vite + Zustand + MUI + React Hook Form + Zod

---

## Commands

### Backend (`cd backend`)

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug       # Start with debugging

# Build & Production
npm run build            # Build for production
npm run start:prod       # Run compiled production build

# Linting & Formatting
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # End-to-end tests

# Run a single test file
npm run test -- users.service.spec.ts
npm run test -- --testPathPattern=users
```

### Frontend (`cd frontend`)

```bash
# Development
npm run dev              # Start Vite dev server

# Build & Production
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build

# Linting & Type Checking
npm run lint             # ESLint
npm run type-check       # TypeScript only (no emit)
```

---

## Code Style - Backend (NestJS/TypeScript)

### Imports

```typescript
// Group imports in this order:
// 1. External libraries (NestJS, TypeORM, etc.)
// 2. Internal modules (@modules/*, @common/*, @config/*)
// 3. Relative imports

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { ActivityService } from '../activity/activity.service';
```

### Path Aliases

Use these aliases instead of relative paths:
- `@modules/*` → `src/modules/*`
- `@common/*` → `src/common/*`
- `@config/*` → `src/config/*`

### Naming Conventions

- **Files**: kebab-case (`user.service.ts`, `auth.module.ts`)
- **Classes**: PascalCase (`AuthService`, `UserEntity`)
- **Interfaces**: PascalCase (`AuthResponse`, `AuthTokens`)
- **DTOs**: PascalCase with `Dto` suffix (`LoginDto`, `RegisterDto`)
- **Entities**: PascalCase with `Entity` suffix (`UserEntity`, `TaskEntity`)
- **Enums**: PascalCase (`ActivityAction`, `EntityType`)
- **Methods/variables**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE

### Types

- Always use explicit return types for public methods
- Avoid `any` - use `unknown` if type is truly unknown
- Use TypeScript strict mode (`strictNullChecks: true`)

```typescript
// Good
async login(loginDto: LoginDto): Promise<AuthResponse> {
  const user = await this.validateUser(loginDto.email, loginDto.password);
  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }
  return { user, ...tokens };
}

// Avoid
async login(loginDto) { /* ... */ }
```

### Error Handling

Use NestJS built-in exceptions:
- `BadRequestException` - 400 errors
- `UnauthorizedException` - 401 errors
- `ForbiddenException` - 403 errors
- `NotFoundException` - 404 errors
- `InternalServerErrorException` - 500 errors

```typescript
// In services
throw new UnauthorizedException('Invalid email or password');
throw new NotFoundException(`User with ID ${id} not found`);
throw new BadRequestException('Email already exists');
```

### DTOs & Validation

Use `class-validator` and `class-transformer`:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;
}
```

### Logging

- Use `@LogActivity` decorator for activity logging
- Use console.error for critical errors that shouldn't break flow

---

## Code Style - Frontend (React/TypeScript)

### Imports

```typescript
// Group imports:
// 1. React/React Router
// 2. External libraries (MUI, Zustand, etc.)
// 3. Internal modules (api, store, types)
// 4. Relative imports

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../types/user.types';
```

### State Management (Zustand)

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(data);
          set({ user: response.user, isAuthenticated: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message });
          throw error;
        }
      },
    }),
    { name: 'auth-storage' }
  )
);
```

### Validation (Zod)

```typescript
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required').min(6, 'Min 6 chars'),
});

type LoginFormData = z.infer<typeof loginSchema>;
```

### Component Structure

- Use functional components with TypeScript
- Use `React.FC` type for components
- Destructure props properly
- Handle loading/error states

```typescript
export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  return (/* JSX */);
};
```

### Naming Conventions

- **Components**: PascalCase (`LoginPage`, `TaskCard`)
- **Hooks**: camelCase starting with `use` (`useAuth`, `useTasks`)
- **Store**: camelCase (`authStore`, `taskStore`)
- **Types**: PascalCase (`User`, `Task`, `LoginDto`)
- **Files**: PascalCase for components (`LoginPage.tsx`), camelCase for others

---

## Testing Guidelines

### Backend Tests

- Test files: `*.spec.ts` in same directory as source
- Use `@nestjs/testing` for unit tests
- Test service methods in isolation with mocks

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { findByEmail: jest.fn() } },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
});
```

### Running Single Tests

```bash
# By file name
npm run test -- auth.service.spec.ts

# By pattern
npm run test -- --testPathPattern=auth

# Watch specific file
npm run test -- users.service.spec.ts --watch
```

---

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/migrations/TaskName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

---

## Common Patterns

### Backend Module Structure
```
modules/[feature]/
  ├── [feature].module.ts
  ├── [feature].controller.ts
  ├── [feature].service.ts
  ├── dto/
  │   ├── create-[feature].dto.ts
  │   └── update-[feature].dto.ts
  ├── entities/
  │   └── [feature].entity.ts
  └── interfaces/
      └── [feature].interfaces.ts
```

### Frontend Component Structure
```
components/
  ├── [feature]/
  │   ├── [Feature]Dialog.tsx
  │   ├── [Feature]Form.tsx
  │   └── [Feature]Card.tsx
  ├── layout/
  └── common/
```

---

## Notes

- Always run `npm run lint` before committing
- Run `npm run type-check` for frontend before committing
- Use meaningful variable names - avoid single letters except in loops
- Keep functions small and focused (single responsibility)
- Add TypeScript types for all function parameters and return values
