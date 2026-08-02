import { Account } from '../accounts/accounts.service';

// Event payload carried over the bus: plain object wrapping the account
// that was just created. Handed from AccountsService (emit) to
// SnapshotsService (listener).
export class GenerateSnapshotsEvent {
  constructor(readonly account: Account) {}
}
