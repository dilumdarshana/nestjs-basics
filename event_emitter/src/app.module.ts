import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountsModule } from './accounts/accounts.module';
import { SnapshotsModule } from './snapshots/snapshots.module';

@Module({
  // EventEmitterModule.forRoot() registers the global EventEmitter2 bus.
  // AccountsModule is the "producer" side (emits snapshots.generate);
  // SnapshotsModule is the "consumer" side (@OnEvent listener). The two
  // modules communicate via the event bus — no direct call between them.
  imports: [EventEmitterModule.forRoot(), AccountsModule, SnapshotsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
