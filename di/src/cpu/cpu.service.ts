import { Injectable } from '@nestjs/common';
import { PowerService } from 'src/power/power.service';

// CpuService depends on PowerService (a shared singleton from PowerModule).
@Injectable()
export class CpuService {
  constructor(private powerService: PowerService) {}

  // Calls PowerService then returns the sum — the dependency is injected,
  // not constructed internally (that's the DI point).
  compute(a: number, b: number): number {
    this.powerService.supplyPower(100);
    console.log('Drawing 100W of power from power service');

    return a + b;
  }
}
