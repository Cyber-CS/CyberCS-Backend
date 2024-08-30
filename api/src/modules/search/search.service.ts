import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SearchDto } from '../../dtos/SearchDto';
import { map } from 'rxjs';
import { MaliciousIntentService } from 'src/modules/malicious-intent/malicious-intent.service';
import { Search, SearchDocument } from 'src/schemas/management/search.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EncryptionService } from '../encryption/encryption.service';

export type Result = {
  filePath: string;
  codeContent: string;
  repositoryName: string;
  repositoryUrl: string;
  maliciousIntent: RegExp[];
};

@Injectable()
export class SearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly maliciousIntentService: MaliciousIntentService,
    private readonly encryptionService: EncryptionService,
    @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
  ) {}

  apiKEY = process.env.GITHUB_API_KEY;

  async search(searchDto: SearchDto): Promise<any> {
    const url = `https://api.github.com/search/code?q=${searchDto.content}`;
    const headers = {
      Authorization: `token ${this.apiKEY}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const response = await this.httpService
      .get(url, { headers })
      .pipe(map((response) => response.data))
      .toPromise()
      .catch((err) => {
        console.error(err);
        return null;
      });

    const results: Result[] = [];
    for (const item of response.items) {
      let a = await this.getCodeContent(item.git_url);
      a = Buffer.from(a, 'base64').toString('utf-8');
      const maliciousIntent =
        await this.maliciousIntentService.checkForMaliciousIntent(a);
      if (maliciousIntent.length > 0) {
        results.push({
          filePath: item.path,
          codeContent: a,
          repositoryName: item.repository.full_name,
          repositoryUrl: item.repository.url,
          maliciousIntent: maliciousIntent,
        });
      }
    }
    const savedSearch = await this.saveSearch(searchDto, results);
    return {
      searchId: savedSearch._id,
      content: savedSearch.content,
      response: savedSearch.response,
    };
  }

  async getCodeContent(url: string): Promise<string> {
    const headers = {
      Authorization: `token ${this.apiKEY}`,
      Accept: 'application/vnd.github.v3+json',
    };

    return this.httpService
      .get(url, { headers })
      .pipe(map((response) => response.data.content))
      .toPromise();
  }

  async saveSearch(searchDto: SearchDto, results: Result[]): Promise<any> {
    const resultsEncrypted = this.encryptionService.encryptArray(results);
    const search = new this.searchModel({
      userId: searchDto.userId,
      name: searchDto.name,
      content: searchDto.content,
      filters: ['filter1', 'filter2'],
      registerDate: new Date(),
      frequency: searchDto.frequency,
      response: resultsEncrypted,
      lenght: results.length,
    });
    const savedSearch = await search.save();
    return savedSearch;
  }

  async findAll(): Promise<Search[]> {
    return this.searchModel.find().exec();
  }

  async findById(id: string): Promise<Search> {
    return this.searchModel.findById(id).exec();
  }

  async searchByUser(userId: string): Promise<any[]> {
    const data = this.searchModel.find({ userId }).exec();
    const response = (await data).map((data) => {
      return {
        searchId: data._id,
        name: data.name,
        content: data.content,
        length: data.length,
        registerDate: data.registerDate,
      };
    });

    return response;
  }
}
