import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

// DEAD CODE — superseded by CurrentUserMiddleware.
// Kept as a learning artifact: it does the same job (load req.currentUser)
// but as an interceptor, so it only runs on routes it is applied to AND
// after guards. The middleware version is global and runs before guards,
// which is why guards can depend on req.currentUser.
@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();

    // in this case, cookie session bind into the request before
    // come to this place.
    const { userId } = request.session || {};

    if (userId) {
      // User service can access via interceptor becz injectable
      // works with interceptors
      const user = await this.usersService.findOne(userId);
      request.currentUser = user;
    }
    // invoke default handle
    return handler.handle();
  }
}
