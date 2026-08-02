import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { NetworkService } from '../network/network.service';
import { Computer } from '../shared/types/computer';

// ComputerService <-> NetworkService is a CIRCULAR dependency:
// ComputerService calls networkService.connectComputer(), while
// NetworkService calls computerService.getComputers() in that method.
// forwardRef wraps the token in a function so Nest resolves it lazily,
// after both providers exist (see computer.module.ts / network.module.ts).
@Injectable()
export class ComputerService {
  private readonly computers: Computer[] = [];

  constructor(
    @Inject(forwardRef(() => NetworkService))
    private readonly networkService: NetworkService,
  ) {}

  addComputer(computer: Computer): void {
    this.computers.push(computer);

    // side effect across the circular boundary: tells NetworkService to
    // re-sync its list from ComputerService's in-memory store.
    this.networkService.connectComputer();
  }

  getComputers(): Computer[] {
    return this.computers;
  }
}
