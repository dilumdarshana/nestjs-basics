import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ComputerService } from '../computer/computer.service';

@Injectable()
export class NetworkService {
  private readonly connectedComputers = [];

  constructor(
    @Inject(forwardRef(() => ComputerService))
    private readonly computerService: ComputerService,
  ) {}

  connectComputer(): void {
    const computers = this.computerService.getComputers();

    for (const computer of computers) {
      this.connectedComputers.push(computer);
    }
  }

  getConnectedComputers(): string[] {
    return this.connectedComputers;
  }
}
