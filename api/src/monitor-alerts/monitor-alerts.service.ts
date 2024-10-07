import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutomaticSearchService } from 'src/modules/automatic-search/automatic-search.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import {
  MonitorAlerts,
  MonitorAlertsDocument,
} from 'src/schemas/monitor-alerts/monitor-alerts.schema';
import { Result } from 'src/types/Result';

@Injectable()
export class MonitorAlertsService {
  constructor(
    private readonly automaticSearchService: AutomaticSearchService,
    private readonly encryptionService: EncryptionService,
    @InjectModel(MonitorAlerts.name)
    private monitorAlertsModel: Model<MonitorAlertsDocument>,
  ) {}

  async checkSearchMonitor(automaticsearchId: string) {
    let rawDifferece: string[];

    const automaticSearchItem =
      await this.automaticSearchService.findById(automaticsearchId);
    if (automaticSearchItem.isAlive) {
      const oldData = automaticSearchItem.response;

      const today = new Date();
      const registerDate = new Date(automaticSearchItem.registerDate);
      const diffTime = Math.abs(today.getTime() - registerDate.getTime());

      if (automaticSearchItem.periodicity === 'diary') {
        if (diffTime > 86400000) {
          const newSearch = await this.automaticSearchService.search({
            userId: automaticSearchItem.userId,
            name: automaticSearchItem.name,
            content: automaticSearchItem.content,
            periodicity: automaticSearchItem.periodicity,
          });
          if (newSearch.response !== oldData) {
            rawDifferece = await this.compareResults(oldData, newSearch);
            if (newSearch.response !== oldData) {
              this.automaticSearchService.updateSearch(
                automaticsearchId,
                newSearch,
              );
            }
          }
        }
      }
      if (automaticSearchItem.periodicity === 'weekly') {
        if (diffTime > 604800000) {
          const newSearch = await this.automaticSearchService.search({
            userId: automaticSearchItem.userId,
            name: automaticSearchItem.name,
            content: automaticSearchItem.content,
            periodicity: automaticSearchItem.periodicity,
          });

          if (newSearch.response !== oldData) {
            rawDifferece = await this.compareResults(oldData, newSearch);
            if (newSearch.response !== oldData) {
              this.automaticSearchService.updateSearch(
                automaticsearchId,
                newSearch,
              );
            }
          }

          automaticSearchItem.isAlive = false;
        }
      }

      if (automaticSearchItem.periodicity === 'monthly') {
        if (diffTime > 2628000000) {
          const newSearch = await this.automaticSearchService.search({
            userId: automaticSearchItem.userId,
            name: automaticSearchItem.name,
            content: automaticSearchItem.content,
            periodicity: automaticSearchItem.periodicity,
          });

          if (newSearch.response !== oldData) {
            rawDifferece = await this.compareResults(oldData, newSearch);
            if (newSearch.response !== oldData) {
              this.automaticSearchService.updateSearch(
                automaticsearchId,
                newSearch,
              );
            }
          }

          automaticSearchItem.isAlive = false;
        }
      }
    }
    // await monitorItem.save();
    // return rawDifferece;
  }

  async findByAutomaticSearchId(automaticsearchId: string) {
    const monitorAlert = await this.monitorAlertsModel.findOne({
      automaticsearchId: automaticsearchId,
    });
    return monitorAlert;
  }

  async compareResults(oldData: any, newData: any) {
    const oldDataDecrypted = this.encryptionService.decryptArray(
      oldData,
    ) as unknown as Result[];
    const newDataDecrypted = this.encryptionService.decryptArray(
      newData,
    ) as unknown as Result[];

    const oldDataFoundIn = oldDataDecrypted.map((r) => r.foundIn);
    const newDataFoundIn = newDataDecrypted.map((r) => r.foundIn);

    const difference = newDataFoundIn.filter(
      (r) => !oldDataFoundIn.includes(r),
    );

    return difference;
  }
}
