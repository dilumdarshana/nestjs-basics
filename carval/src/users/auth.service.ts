import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.userService.find(email);

    if (users.length > 0) {
      throw new BadRequestException('User already exists');
    }

    // Hash format stored in DB: "<salt-hex>.<hash-hex>" (scrypt, 32-byte key).
    // The salt is unique per user and stored alongside the hash so signin
    // can recompute the same hash.
    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const passwordSalted = salt + '.' + hash.toString('hex');

    // store data on db
    const user = await this.userService.create(email, passwordSalted);

    return user;
  }

  async signin(email: string, password: string) {
    // validate email exists in the db
    const [user] = await this.userService.find(email);

    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    // re-derive the hash with the stored salt and compare hex strings.
    // NOTE: a plain string compare is not timing-safe (README Gotchas).
    const [salt, passwordDb] = user.password.split('.');

    // hash the given password and compare with db password
    const passwordGiven = (await scrypt(password, salt, 32)) as Buffer;

    if (passwordDb !== passwordGiven.toString('hex')) {
      throw new UnauthorizedException('Username or password is incorrect');
    }

    // authenticated: the controller sets session.userId from this user
    return user;
  }
}
