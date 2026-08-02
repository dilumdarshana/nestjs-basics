import { Controller, Get } from '@nestjs/common';
import { Computer } from '../shared/types/computer';
import { NetworkService } from './network.service';

@Controller('network')
export class NetworkController {
  constructor(private networkService: NetworkService) {}

  // Lists whatever ComputerService's store contained at the last
  // connectComputer() call (see network.service.ts).
  @Get()
  getConnectedComputers(): Computer[] {
    return this.networkService.getConnectedComputers();
  }
}
