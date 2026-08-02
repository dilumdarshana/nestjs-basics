import { Injectable } from '@nestjs/common';

// Dependency-injection leaf: no dependencies of its own. Both CpuService and
// DiskService inject this same singleton (see power.module.ts exports).
@Injectable()
export class PowerService {
  supplyPower(watt: number): void {
    console.log('supplying power', watt);
  }
}
