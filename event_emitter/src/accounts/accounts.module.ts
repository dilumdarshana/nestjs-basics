import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  // exported so SnapshotsModule (which imports AccountsModule) can inject
  // AccountsService — though the real hand-off is via the event bus.
  exports: [AccountsService],
})
export class AccountsModule {}
