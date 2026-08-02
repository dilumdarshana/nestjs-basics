import { Injectable, PipeTransform } from '@nestjs/common';

// Runs right before the route handler, AFTER guards and interceptors.
// NOTE: the global ValidationPipe in main.ts also runs (whitelist+transform);
// this route-level MyPipe runs in addition to it.
@Injectable()
export class MyPipe implements PipeTransform {
  transform(value: unknown) {
    console.log('calling pipe...');
    return value; // Return transformed value
  }
}
