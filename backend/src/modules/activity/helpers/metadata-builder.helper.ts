/**
 * Metadata builder helpers for activity logging
 * These functions create structured metadata for different entity types
 */

/**
 * Build metadata for team-related activities
 */
export function buildTeamMetadata(
  team: any,
  changes?: Partial<any>,
): Record<string, any> {
  const metadata: Record<string, any> = {
    teamId: team.id,
    teamName: team.name,
  };

  if (team.description) {
    metadata.teamDescription = team.description;
  }

  if (team.ownerId) {
    metadata.ownerId = team.ownerId;
  }

  // Include changes if provided
  if (changes) {
    const sanitizedChanges = sanitizeChanges(changes);
    if (Object.keys(sanitizedChanges).length > 0) {
      metadata.changes = sanitizedChanges;
    }
  }

  return metadata;
}

/**
 * Build metadata for task-related activities
 */
export function buildTaskMetadata(
  task: any,
  changes?: Partial<any>,
): Record<string, any> {
  const metadata: Record<string, any> = {
    taskId: task.id,
    taskTitle: task.title,
  };

  if (task.description) {
    metadata.taskDescription = task.description;
  }

  if (task.status) {
    metadata.status = task.status;
  }

  if (task.priority) {
    metadata.priority = task.priority;
  }

  if (task.teamId) {
    metadata.teamId = task.teamId;
  }

  if (task.assignedToId) {
    metadata.assignedToId = task.assignedToId;
  }

  if (task.assignedTo?.email) {
    metadata.assignedToEmail = task.assignedTo.email;
  }

  if (task.createdById) {
    metadata.createdById = task.createdById;
  }

  if (task.dueDate) {
    metadata.dueDate = task.dueDate;
  }

  // Include changes if provided
  if (changes) {
    const sanitizedChanges = sanitizeChanges(changes);
    if (Object.keys(sanitizedChanges).length > 0) {
      metadata.changes = sanitizedChanges;

      // Highlight specific field changes
      if (changes.status) {
        metadata.oldStatus = changes.status.old;
        metadata.newStatus = changes.status.new;
      }

      if (changes.priority) {
        metadata.oldPriority = changes.priority.old;
        metadata.newPriority = changes.priority.new;
      }

      if (changes.assignedToId) {
        metadata.oldAssignedTo = changes.assignedToId.old;
        metadata.newAssignedTo = changes.assignedToId.new;
      }
    }
  }

  return metadata;
}

/**
 * Build metadata for user-related activities (sanitized)
 */
export function buildUserMetadata(
  user: any,
  changes?: Partial<any>,
): Record<string, any> {
  const metadata: Record<string, any> = {
    userId: user.id,
    userEmail: user.email,
  };

  if (user.firstName) {
    metadata.firstName = user.firstName;
  }

  if (user.lastName) {
    metadata.lastName = user.lastName;
  }

  if (user.role) {
    metadata.role = user.role;
  }

  // Include changes if provided (sanitized)
  if (changes) {
    const sanitizedChanges = sanitizeChanges(changes);
    if (Object.keys(sanitizedChanges).length > 0) {
      metadata.changes = sanitizedChanges;
    }
  }

  return metadata;
}

/**
 * Build metadata for authentication activities
 */
export function buildAuthMetadata(
  action: string,
  email: string,
  additionalInfo?: Record<string, any>,
): Record<string, any> {
  const metadata: Record<string, any> = {
    action,
    email,
  };

  if (additionalInfo) {
    // Add additional info but sanitize it first
    const sanitized = sanitizeChanges(additionalInfo);
    Object.assign(metadata, sanitized);
  }

  return metadata;
}

/**
 * Build metadata for team member activities
 */
export function buildTeamMemberMetadata(
  teamId: string,
  teamName: string,
  memberEmail: string,
  role?: string,
  oldRole?: string,
): Record<string, any> {
  const metadata: Record<string, any> = {
    teamId,
    teamName,
    memberEmail,
  };

  if (role) {
    metadata.role = role;
  }

  if (oldRole) {
    metadata.oldRole = oldRole;
    metadata.newRole = role;
  }

  return metadata;
}

/**
 * Sanitize changes object to remove sensitive fields
 */
export function sanitizeChanges(changes: Partial<any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
  ];

  for (const [key, value] of Object.entries(changes)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some((field) =>
      lowerKey.includes(field.toLowerCase()),
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === 'object' ? sanitizeChanges(item) : item,
        );
      } else {
        sanitized[key] = sanitizeChanges(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Build metadata for task assignment
 */
export function buildTaskAssignmentMetadata(
  taskId: string,
  taskTitle: string,
  assignedToEmail: string,
  assignedById: string,
  teamId?: string,
): Record<string, any> {
  const metadata: Record<string, any> = {
    taskId,
    taskTitle,
    assignedToEmail,
    assignedById,
  };

  if (teamId) {
    metadata.teamId = teamId;
  }

  return metadata;
}

/**
 * Build metadata for task status change
 */
export function buildTaskStatusChangeMetadata(
  taskId: string,
  taskTitle: string,
  oldStatus: string,
  newStatus: string,
  teamId?: string,
): Record<string, any> {
  const metadata: Record<string, any> = {
    taskId,
    taskTitle,
    oldStatus,
    newStatus,
  };

  if (teamId) {
    metadata.teamId = teamId;
  }

  return metadata;
}

/**
 * Build metadata for task priority change
 */
export function buildTaskPriorityChangeMetadata(
  taskId: string,
  taskTitle: string,
  oldPriority: string,
  newPriority: string,
  teamId?: string,
): Record<string, any> {
  const metadata: Record<string, any> = {
    taskId,
    taskTitle,
    oldPriority,
    newPriority,
  };

  if (teamId) {
    metadata.teamId = teamId;
  }

  return metadata;
}