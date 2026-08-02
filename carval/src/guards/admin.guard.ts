import { ExecutionContext, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';

// Requires an authenticated + admin user.
// NOTE: reads req.currentUser, which is only populated by
// CurrentUserMiddleware. On an unauthenticated request currentUser is
// undefined -> this throws -> 500 instead of a clean 401/403.
// Combine with AuthGuard (or null-check) for correct status codes.
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request) return false;

    return request.currentUser.admin;
  }
}
