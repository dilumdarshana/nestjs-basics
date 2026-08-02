import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Runs before anything else on each request (registered globally in
// AppModule.configure). Prints FIRST in the console log sequence.
@Injectable()
export class MyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Middleware called');
    next(); // must call next() or the request hangs here
  }
}
