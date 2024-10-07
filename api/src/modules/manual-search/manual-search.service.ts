import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ManualSearchDto } from '../../dtos/ManualSearchDto';
import { map } from 'rxjs';
import { MaliciousIntentService } from 'src/modules/malicious-intent/malicious-intent.service';
import { ManualSearch, ManualSearchDocument } from 'src/schemas/management/manual-search.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EncryptionService } from '../encryption/encryption.service';
import { Result } from 'src/types/Result';

@Injectable()
export class ManualSearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly maliciousIntentService: MaliciousIntentService,
    private readonly encryptionService: EncryptionService,
    @InjectModel(ManualSearch.name) private searchModel: Model<ManualSearchDocument>,
  ) {}

  githubApiKEY = process.env.GITHUB_API_KEY;
  gitlabApiKEY = process.env.GITLAB_API_KEY;
  bitbucketUSERNAME = process.env.BITBUCKET_USERNAME;
  bitbucketPASSWORD = process.env.BITBUCKET_PASSWORD;

  async search(searchDto: ManualSearchDto): Promise<any> {
    const results: Result[] = [];

    // const gitlabUrl = `https://gitlab.com/api/v4/search`;
    // const gitlabOptions = [
    //   'blobs',
    //   'commits',
    //   'issues',
    //   'merge_requests',
    //   'milestones',
    //   'projects',
    //   'snippet_titles',
    //   'users',
    // ];

    // gitlabOptions.forEach(async (option) => {
    //   const gitlabResponse = await this.httpService
    //     .get(gitlabUrl, {
    //       headers: {
    //         'PRIVATE-TOKEN': this.gitlabApiKEY,
    //       },
    //       params: {
    //         scope: option,
    //         search: searchDto.content,
    //       },
    //     })
    //     .pipe(
    //       map((response) => {
    //         response.data,
    //           response.data.forEach((item) => {
    //             results.push({
    //               filePath: item.path,
    //               codeContent: item.content,
    //               repositoryName: item.repository.name,
    //               repositoryUrl: item.web_url,
    //               maliciousIntent: [],
    //               foundIn: 'gitlab',
    //             });
    //           });
    //       }),
    //     )
    //     .toPromise()
    //     .catch((err) => {
    //       console.error(err);
    //       return null;
    //     });
    // });

    // const bitbucketUrl = `https://api.bitbucket.org/2.0/repositories`;
    // const bitbuckeResponse = await this.httpService
    //   .get(bitbucketUrl, {
    //     auth: {
    //       username: this.bitbucketUSERNAME,
    //       password: this.bitbucketPASSWORD,
    //     },
    //     params: { q: searchDto.content },
    //   })
    //   .pipe(map((response) => response.data))
    //   .toPromise()
    //   .catch((err) => {
    //     console.error(err);
    //     return null;
    //   });

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
            q: searchDto.content,
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

    const savedSearch = await this.saveSearch(searchDto, results.length);
    return {
      searchId: savedSearch._id,
      content: savedSearch.content,
      response: this.encryptionService.encryptArray(results),
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

  async saveSearch(searchDto: ManualSearchDto, resultsLength: number): Promise<any> {
    const search = new this.searchModel({
      userId: searchDto.userId,
      name: searchDto.name,
      content: searchDto.content,
      registerDate: new Date(),
      length: resultsLength,
    });
    const savedSearch = await search.save();
    return savedSearch;
  }

  async findAll(): Promise<ManualSearch[]> {
    return this.searchModel.find().exec();
  }

  async findById(id: string): Promise<ManualSearch> {
    return this.searchModel.findById(id).exec();
  }

  async findByUser(userId: string): Promise<ManualSearch[]> {
    return this.searchModel
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
        // foundIn: Array.from(
        //   new Set(
        //     (
        //       this.encryptionService.decryptArray(
        //         responses,
        //       ) as unknown as Result[]
        //     ).map((r) => r.foundIn),
        //   ),
        // ),
      };
    });

    return response;
  }
}
