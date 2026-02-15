import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/users/entities/user.entity';

type CurrentUserKey = keyof User;

/**
 * Usage:
 * - `@CurrentUser()` -> full user object
 * - `@CurrentUser('id')` -> specific user field
 */
export const CurrentUser = createParamDecorator(
  (data: CurrentUserKey | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User | undefined;

    if (!data) {
      return user;
    }

    return user?.[data];
  },
);