import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SearchDto } from '../../dtos/SearchDto';
import { map } from 'rxjs';
import { MaliciousIntentService } from 'src/modules/malicious-intent/malicious-intent.service';
import { Search, SearchDocument } from 'src/schemas/management/search.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

type Result = {
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
    @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
  ) {}

  apiKEY = process.env.GITHUB_API_KEY;

  async search(searchDto: SearchDto): Promise<any> {
    const savedSearch = await this.saveSearch(searchDto);
    const url = `https://api.github.com/search/code?q=${searchDto.content}`;
    const headers = {
      Authorization: `token ${this.apiKEY}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const response = await this.httpService
      .get(url, { headers })
      .pipe(map((response) => response.data))
      .toPromise();

    const results: Result[] = [];
    for (const item of response.items) {
      let a = await this.getCodeContent(item.git_url);
      a = Buffer.from(a, 'base64').toString('utf-8');
      const maliciousIntent =
        await this.maliciousIntentService.checkForMaliciousIntent(a);
      results.push({
        filePath: item.path,
        codeContent: a,
        repositoryName: item.repository.full_name,
        repositoryUrl: item.repository.url,
        maliciousIntent: maliciousIntent,
      });
    }
    return {
      searchId: savedSearch._id,
      response: results,
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

  async saveSearch(searchDto: SearchDto): Promise<any> {
    const search = new this.searchModel({
      name: searchDto.name,
      content: searchDto.content,
      filters: ['filter1', 'filter2'],
      registerDate: new Date(),
      frequency: searchDto.frequency,
    });
    return search.save();
  }
  async findAll(): Promise<Search[]> {
    return this.searchModel.find().exec();
  }
}
