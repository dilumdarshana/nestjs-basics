import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

// Runs AFTER middleware but BEFORE interceptors/pipes. Returning false rejects
// the request before the handler is reached (would surface as a 403).
// The console log here demonstrates the ordering: after "Middleware called",
// before the interceptor's "Before...".
@Injectable()
export class MyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: unknown = context.switchToHttp().getRequest();

    if (!request) return false;
    console.log('Guard is calling...');
    return true;
  }
}
