import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { map } from 'rxjs';
import {
  AutomaticSearch,
  AutomaticSearchDocument,
} from 'src/schemas/automatic-search/automatic-search.schema';
import { EncryptionService } from '../encryption/encryption.service';
import { Model } from 'mongoose';
import { MaliciousIntentService } from '../malicious-intent/malicious-intent.service';
import { Result } from 'src/types/Result';
import { AutomaticSearchDto } from 'src/dtos/AutomaticSearchDto';

@Injectable()
export class AutomaticSearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly maliciousIntentService: MaliciousIntentService,
    private readonly encryptionService: EncryptionService,
    @InjectModel(AutomaticSearch.name)
    private automaticSearchModel: Model<AutomaticSearchDocument>,
  ) {}

  githubApiKEY = process.env.GITHUB_API_KEY;
  gitlabApiKEY = process.env.GITLAB_API_KEY;
  bitbucketUSERNAME = process.env.BITBUCKET_USERNAME;
  bitbucketPASSWORD = process.env.BITBUCKET_PASSWORD;

  async search(automaticSearchDto: AutomaticSearchDto): Promise<any> {
    const results: Result[] = [];

    const githubUrl = `https://api.github.com/search/code`;
    const pages = 1;
    const githubHeaders = {
      Authorization: `token ${this.githubApiKEY}`,
      Accept: 'application/vnd.github.v3+json',
    };

    for (let i = 1; i <= pages; i++) {
      const response = await this.httpService
        .get(githubUrl, {
          headers: githubHeaders,
          params: {
            q: automaticSearchDto.content,
            page: i,
            per_page: 100,
            order: 'desc',
            sort: 'indexed',
          },
        })
        .pipe(map((response) => response.data))
        .toPromise()
        .catch((err) => {
          console.error(err);
          return null;
        });

      if (!response || response.items.length === 0) break;

      for (const item of response.items) {
        let content = await this.getCodeContent(item.git_url);
        content = Buffer.from(content, 'base64').toString('utf-8');
        const maliciousIntent =
          await this.maliciousIntentService.checkForMaliciousIntent(content);

        if (maliciousIntent.length > 0) {
          results.push({
            filePath: item.path,
            codeContent: content,
            repositoryName: item.repository.full_name,
            repositoryUrl: item.repository.url,
            maliciousIntent: maliciousIntent,
            foundIn: 'github',
          });
        }
      }
    }

    const savedSearch = await this.saveSearch(automaticSearchDto, results);
    return {
      searchId: savedSearch._id,
      content: savedSearch.content,
      response: savedSearch.response,
      foundIn: results.map((r) => r.foundIn),
    };
  }

  async getCodeContent(url: string): Promise<string> {
    const headers = {
      Authorization: `token ${this.githubApiKEY}`,
      Accept: 'application/vnd.github.v3+json',
    };

    return this.httpService
      .get(url, { headers })
      .pipe(map((response) => response.data.content))
      .toPromise();
  }

  async saveSearch(
    automaticSearchDto: AutomaticSearchDto,
    results: Result[],
  ): Promise<any> {
    const resultsEncrypted = this.encryptionService.encryptArray(results);
    const search = new this.automaticSearchModel({
      userId: automaticSearchDto.userId,
      name: automaticSearchDto.name,
      content: automaticSearchDto.content,
      registerDate: new Date(),
      response: resultsEncrypted,
      length: results.length,
    });
    const savedSearch = await search.save();
    return savedSearch;
  }

  async findAll(): Promise<AutomaticSearch[]> {
    return this.automaticSearchModel.find().exec();
  }

  async findById(id: string): Promise<AutomaticSearch> {
    return this.automaticSearchModel.findById(id).exec();
  }

  async findByUser(userId: string): Promise<AutomaticSearch[]> {
    return this.automaticSearchModel
      .find({ userId })
      .sort({ registerDate: -1 })
      .limit(5)
      .exec();
  }

  async searchByUser(userId: string): Promise<any[]> {
    const data = await this.findByUser(userId);
    const responses = data[0].response[0] as unknown as string;
    const response = data.map((data) => {
      return {
        searchId: data._id,
        name: data.name,
        content: data.content,
        length: data.length,
        registerDate: data.registerDate,
        foundIn: Array.from(
          new Set(
            (
              this.encryptionService.decryptArray(
                responses,
              ) as unknown as Result[]
            ).map((r) => r.foundIn),
          ),
        ),
      };
    });

    return response;
  }

  async updateSearch(searchId: string, newResponse: Result[]): Promise<any> {
    const search = await this.automaticSearchModel.findById(searchId).exec();
    search.response = newResponse;
    search.length = newResponse.length;
    await search.save();
    return search;
  }
}
