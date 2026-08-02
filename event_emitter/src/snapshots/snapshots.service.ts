import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Account, AccountsService } from '../accounts/accounts.service';
import { GenerateSnapshotsEvent } from './generate-snapshot.event';

export interface Snapshot {
  account: Account;
  date: Date;
}

// CONSUMER side of the event flow: SnapshotsService never talks to
// AccountsService directly — it reacts to the 'snapshots.generate' event
// that AccountsService emits. (AccountsService is injected only because
// SnapshotsModule imports AccountsModule; the listener uses event.account.)
@Injectable()
export class SnapshotsService {
  public readonly snapshots: Snapshot[] = [];

  constructor(private accountsService: AccountsService) {}

  // @OnEvent registers this method as a listener for the given event name.
  // Called asynchronously by the event bus right after emit() — decoupled
  // from the request that produced the account.
  @OnEvent('snapshots.generate')
  generateSnapshots(event: GenerateSnapshotsEvent) {
    // const accounts = this.accountsService.getAccounts();
    // console.log('xxxxx', event.account);
    // for (const account of accounts) {
    //   this.snapshots.push({
    //     account,
    //     date: new Date(),
    //   });
    // }
    this.snapshots.push({
      account: event.account,
      date: new Date(),
    });
  }

  getSnapshots() {
    return this.snapshots;
  }
}
