import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

// Registers req.currentUser on the Express request object, once per request.
// Registered globally in AppModule.configure() so every route has access.
//
// WHY a middleware instead of the (dead) CurrentUserInterceptor?
// - Middleware runs for ALL routes, before guards -> guards can rely on
//   req.currentUser being set (see AdminGuard).
// - Interceptors run only for routes they're applied to, and AFTER guards,
//   so a guard reading req.currentUser would see it unset.
declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private userService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // cookie-session attaches the signed cookie payload to req.session
    // BEFORE middleware runs (it is registered first in AppModule.configure).
    const { userId } = req.session || {};

    if (userId) {
      const user = await this.userService.findOne(userId);

      if (user) {
        req.currentUser = user;
      }
    }

    next();
  }
}
