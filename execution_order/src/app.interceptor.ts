import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Runs AFTER guards but BEFORE pipes on the way in, and AFTER the handler
// on the way out (via the tap() on next.handle()). The "Before..."/"After..."
// logs bracket the pipe + controller + service execution.
@Injectable()
export class MyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Interceptor -> Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`Interceptor -> After... ${Date.now() - now}ms`)),
      );
  }
}
