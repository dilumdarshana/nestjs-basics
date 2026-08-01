import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

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
