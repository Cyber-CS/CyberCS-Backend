import { HttpService } from '@nestjs/axios';
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
    private readonly httpService: HttpService,
    private readonly automaticSearchService: AutomaticSearchService,
    private readonly encryptionService: EncryptionService,
    @InjectModel(MonitorAlerts.name)
    private monitorAlertsModel: Model<MonitorAlertsDocument>,
  ) {}

  async checkSearchMonitor(userId: string) {
    const alertsResponse = [];

    const allAutomaticSearches =
      await this.automaticSearchService.findAllByUserId(userId);
    allAutomaticSearches.forEach(async (automaticSearch) => {
      const automaticSearchItem = await this.automaticSearchService.findById(
        automaticSearch._id,
      );
      if (automaticSearchItem.isAlive) {
        let rawDifference: Result[] = [];
        const oldData = automaticSearchItem.response;

        const today = new Date();
        const registerDate = new Date(automaticSearchItem.registerDate);
        const diffTime = Math.abs(today.getTime() - registerDate.getTime());

        if (
          (automaticSearchItem.periodicity === 'diary' &&
            diffTime > 86400000) ||
          (automaticSearchItem.periodicity === 'weekly' &&
            diffTime > 604800000) ||
          (automaticSearchItem.periodicity === 'monthly' &&
            diffTime > 2628000000)
        ) {
          const newSearch = await this.automaticSearchService.search({
            userId: automaticSearchItem.userId,
            name: automaticSearchItem.name,
            content: automaticSearchItem.content,
            periodicity: automaticSearchItem.periodicity,
          });

          rawDifference = await this.compareResults(oldData, newSearch);
          if (rawDifference.length > 0) {
            this.automaticSearchService.updateSearch(
              automaticSearch._id,
              newSearch,
            );
            await this.monitorAlertsModel.create({
              automaticsearchId: automaticSearch._id,
              userId: automaticSearchItem.userId,
              response: rawDifference,
              registerDate: new Date(),
            });

            const monitorAlertSaved = await this.saveMonitorAlert({
              automaticsearchId: automaticSearch._id,
              userId: automaticSearchItem.userId,
              response: rawDifference,
              registerDate: new Date(),
            });

            await this.httpService.post(
              'http://localhost:3000/send-email-new-threat',
              {
                userId: automaticSearchItem.userId,
                user_name: automaticSearchItem.name,
                search_name: automaticSearchItem.content,
                threats: rawDifference,
              },
            );

            alertsResponse.push(monitorAlertSaved);
          }
        }
        return alertsResponse;
      }
    });
  }

  async findByAutomaticSearchId(automaticsearchId: string) {
    const monitorAlert = await this.monitorAlertsModel.findOne({
      automaticsearchId: automaticsearchId,
    });
    return monitorAlert;
  }

  async compareResults(oldData: any, newData: any): Promise<Result[]> {
    const oldDataDecrypted = this.encryptionService.decryptArray(
      oldData,
    ) as unknown as Result[];
    const newDataDecrypted = this.encryptionService.decryptArray(
      newData,
    ) as unknown as Result[];

    const newResults = newDataDecrypted.filter(
      (newResult) =>
        !oldDataDecrypted.some(
          (oldResult) => oldResult.codeContent === newResult.codeContent,
        ),
    );

    return newResults;
  }

  async saveMonitorAlert(monitorAlert: Omit<MonitorAlerts, '_id'>) {
    return this.monitorAlertsModel.create(monitorAlert);
  }
}
