import { Body, Controller, Post } from '@nestjs/common';
import { AccountsService } from './accounts.service';

interface CreateUserDto {
  name: string;
  amount: number;
}

@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  // Entry point of the flow: creating an account triggers the event that
  // SnapshotsService listens to. Returns 201 with empty body (no return).
  @Post()
  create(@Body() body: CreateUserDto) {
    this.accountsService.create(body);
  }
}
