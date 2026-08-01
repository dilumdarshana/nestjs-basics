import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

type CustomRequest = Request & {
  headers: Request['headers'] & {
    authorization?: string;
  };
};

@Injectable()
export class LocalAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();

    return this.validateRequest(request);
  }

  private async validateRequest(req: CustomRequest): Promise<boolean> {
    // implement your request validation logic here
    const authHeader = req.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('Token not provided');

    const [, token] = authHeader.split(' ');
    if (!token) throw new UnauthorizedException('Token not provided');

    // verify JWT token
    // TODO:

    return true;
  }
}
