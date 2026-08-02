import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ComputerService } from '../computer/computer.service';
import { Computer } from '../shared/types/computer';

// The other half of the circular dependency (see computer.service.ts).
// NetworkService depends on ComputerService to know which computers exist.
@Injectable()
export class NetworkService {
  private readonly connectedComputers: Computer[] = [];

  constructor(
    @Inject(forwardRef(() => ComputerService))
    private readonly computerService: ComputerService,
  ) {}

  // Pulls ALL computers from ComputerService each time — not incremental.
  // (Demo code: fine for learning, but duplicates entries across calls.)
  connectComputer(): void {
    const computers = this.computerService.getComputers();

    for (const computer of computers) {
      this.connectedComputers.push(computer);
    }
  }

  getConnectedComputers(): Computer[] {
    return this.connectedComputers;
  }
}
