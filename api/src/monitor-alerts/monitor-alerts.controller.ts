import { Controller, Get } from '@nestjs/common';
import { MonitorAlertsService } from './monitor-alerts.service';

@Controller()
export class MonitorAlertsController {
  constructor(private readonly monitorAlertsService: MonitorAlertsService) {}

  @Get('monitor-alerts')
  async checkSearchMonitor(userId: string) {
    const response = this.monitorAlertsService.checkSearchMonitor(userId);
    return { status: 'ok', data: response };
  }
}
