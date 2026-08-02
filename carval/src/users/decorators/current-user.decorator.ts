import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// @CurrentUser() user: User — parameter decorator.
// Extracts the user that CurrentUserMiddleware placed on the request.
// Runs when the route handler is invoked (after guards), so currentUser is
// guaranteed to be set by then if the middleware ran.
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.currentUser;
  },
);
