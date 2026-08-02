import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  NotFoundException,
  Session,
  // UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CrateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
// import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
// import { CurrentUserInterceptor } from './interceptors/current-usr.interceptor';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
@Serialize(UserDto)
// @UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signup')
  async createUser(@Body() body: CrateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    // cookie-session: assign userId -> the signed cookie now carries it, so
    // subsequent requests are authenticated (CurrentUserMiddleware resolves it).
    session.userId = user.id;

    return user;
  }

  @Post('/signin')
  async signin(@Body() body: CrateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    // same as signup: persist the authenticated userId in the session cookie
    session.userId = user.id;

    return user;
  }

  @Post('/signout')
  signout(@Session() session: any) {
    // NOTE: only nulls userId — the cookie itself stays, so the client still
    // holds a (now useless) signed cookie. A real impl should clear it.
    session.userId = null;
  }

  // @UseInterceptors(new SerializeInterceptor(UserDto)) // can exclude some properties
  // Note: create/find/update/delete below are deliberately UNGUARDED in this
  // tutorial (README Gotchas) — anyone can read/modify users by id.
  @Get('/:id')
  async findUser(@Param('id') id: number) {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
