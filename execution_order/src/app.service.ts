import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PostHelloDto } from './app.types';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  // Last step of the request lifecycle: the handler hands the (already
  // validated + transformed) DTO to the service. The runtime check is a
  // belt-and-braces guard for the DTO's @IsNumber().
  postHello(data: PostHelloDto) {
    console.log('Calling Service...', data);

    if (typeof data.age !== 'number') {
      throw new UnprocessableEntityException(
        'Invalid data. Age must be a number',
      );
    }
    return data;
  }
}
