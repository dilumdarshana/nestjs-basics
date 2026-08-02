import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

// otherwise can pass anything to the Serialize decorator
interface ClassConstructor {
  new (...args: any[]): object;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

// Response-shaping interceptor: strips any property not exposed by the DTO
// (uses plainToInstance + excludeExtraneousValues: true). E.g. @Serialize(UserDto)
// removes the hashed password from API responses.
//
// LIFECYCLE: interceptors run AFTER guards but BEFORE pipes. That ordering is
// why the req.body mutation below lands before ValidationPipe sees the body —
// the pipe (whitelist: true) then strips those injected keys. This is the
// documented reason the comment below warns against doing it here.
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  /**
   * context: gives you access to the request/response cycle (can extract req data if needed).
   * next.handle(): calls the actual route handler or next middleware.
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // run something before a request is handled by the request handler
    // console.log('I am running before the handler', context);

    // lets say any use case to inject new data to the request object before it goes
    // to the contoller
    const req = context.switchToHttp().getRequest();
    // Example modification: Add a new property or override existing
    // (demonstration only — mutating req.body here is a side effect; the
    // README notes it works only because ValidationPipe strips extras).
    if (req.body) {
      req.body.modifiedByInterceptor = true;
      req.body.timestamp = Date.now();
    }

    // this might break the input validations happens through the pipes. Because interceptors
    // works before the pipes. Therefore, this kind of modifications better to do via middlewares

    return next.handle().pipe(
      map((data: any) => {
        // run something before the response is sent out
        // console.log('I am running before response is sent out', data);
        // plainToInstance(dto, data) copies data onto a DTO instance; with
        // excludeExtraneousValues only @Expose()-decorated fields survive.
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
