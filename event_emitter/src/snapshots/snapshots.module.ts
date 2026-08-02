import { Module } from '@nestjs/common';
import { SnapshotsController } from './snapshots.controller';
import { SnapshotsService } from './snapshots.service';
import { AccountsModule } from 'src/accounts/accounts.module';

@Module({
  // imports AccountsModule so SnapshotsService can inject AccountsService.
  // Note: the actual coupling is via the EVENT BUS, not this import — the
  // listener reacts to 'snapshots.generate' regardless of module wiring.
  imports: [AccountsModule],
  controllers: [SnapshotsController],
  providers: [SnapshotsService],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}
