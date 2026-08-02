import { ExecutionContext, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';

// Guards run AFTER middleware but BEFORE pipes/interceptors.
// Returning a falsy value (e.g. undefined userId) rejects the request
// with a 403 (there is no unauthenticated session here -> 401 by default).
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // cookie-session attaches the signed cookie's payload to req.session.
    // userId is set on signup/signin and nulled on signout.
    return request.session.userId;
  }
}
