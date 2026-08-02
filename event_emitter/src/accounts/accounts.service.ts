import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GenerateSnapshotsEvent } from '../snapshots/generate-snapshot.event';

export interface Account {
  name: string;
  amount: number;
}

// PRODUCER side of the event flow: AccountsService does its own job (store
// the account) and then publishes an event to the global bus. It does NOT
// know or call the snapshots logic directly — decoupling is the point.
@Injectable()
export class AccountsService {
  private readonly accounts: Account[] = [];

  // EventEmitter2 is injected from the global EventEmitterModule.
  constructor(private readonly eventEmitter: EventEmitter2) {}

  create(account: Account) {
    this.accounts.push(account);

    // publish: any @OnEvent('snapshots.generate') listener anywhere in the
    // app will react (here: SnapshotsService.generateSnapshots). Fire-and-
    // forget — create() returns without waiting for listeners.
    this.eventEmitter.emit(
      'snapshots.generate',
      new GenerateSnapshotsEvent(account),
    );
  }

  getAccounts() {
    return this.accounts;
  }
}
