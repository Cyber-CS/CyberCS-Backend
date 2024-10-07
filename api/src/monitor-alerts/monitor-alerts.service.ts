import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutomaticSearchService } from 'src/modules/automatic-search/automatic-search.service';
import {
  MonitorAlerts,
  MonitorAlertsDocument,
} from 'src/schemas/monitor-alerts/monitor-alerts.schema';

@Injectable()
export class MonitorAlertsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly automaticSearchService: AutomaticSearchService,
    @InjectModel(MonitorAlerts.name)
    private monitorAlertsModel: Model<MonitorAlertsDocument>,
  ) {}

  async checkSearchMonitor(automaticsearchId: string) {
    const monitorItem = await this.findByAutomaticSearchId(automaticsearchId);
    const oldData = monitorItem.response;
    if (monitorItem.isAlive) {
      const today = new Date();
      const registerDate = new Date(monitorItem.registerDate);
      const diffTime = Math.abs(today.getTime() - registerDate.getTime());
      switch (monitorItem.periodicity) {
        case 'diary':
          if (diffTime > 86400000) {
            const newSearch = this.automaticSearchService.search(monitorItem);
            if (newSearch !== oldData) {
              monitorItem.response = newSearch;
              monitorItem.registerDate = today;
              await monitorItem.save();
            }
            await monitorItem.save();
          }
          break;
        case 'weekly':
          if (diffTime > 604800000) {
            monitorItem.isAlive = false;
            await monitorItem.save();
          }
          break;

        case 'monthly':
          if (diffTime > 2628000000) {
            monitorItem.isAlive = false;
            await monitorItem.save();
          }
          break;
      }
    }

    return monitorItem;
  }

  async findByAutomaticSearchId(automaticsearchId: string) {
    const monitorAlert = await this.monitorAlertsModel.findOne({
      automaticsearchId: automaticsearchId,
    });
    return monitorAlert;
  }
