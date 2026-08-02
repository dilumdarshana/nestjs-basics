import { Injectable } from '@nestjs/common';
import { PowerService } from 'src/power/power.service';

// Same PowerService singleton as CpuService uses (shared via PowerModule) —
// see disk.module.ts for the comment on why both get the same instance.
@Injectable()
export class DiskService {
  constructor(private powerService: PowerService) {}

  getData(): string {
    console.log('Drawing 20W of power from PowerService');
    this.powerService.supplyPower(20);

    return 'Something';
  }
}
