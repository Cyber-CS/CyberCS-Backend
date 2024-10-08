import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ManualSearchDto } from '../../dtos/ManualSearchDto';
import { map } from 'rxjs';
import { MaliciousIntentService } from 'src/modules/malicious-intent/malicious-intent.service';
import {
  ManualSearch,
  ManualSearchDocument,
} from 'src/schemas/management/manual-search.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EncryptionService } from '../encryption/encryption.service';
import { EmpresaService } from '../Empresa/empresa.service';
import {
  SearchByCompanyHash,
  SearchByCompanyHashDocument,
} from '../../schemas/management/search-by-company-hash.schema';
import { Result } from 'src/types/Result';

export type ResultWithoutMaliciousIntent = {
  filePath: string;
  codeContent: string;
  repositoryName: string;
  repositoryUrl: string;
  foundIn: string;
};

@Injectable()
export class ManualSearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly maliciousIntentService: MaliciousIntentService,
    private readonly encryptionService: EncryptionService,
    @InjectModel(ManualSearch.name)
    private searchModel: Model<ManualSearchDocument>,
    @InjectModel(SearchByCompanyHash.name)
    private searchByCompanyHashModel: Model<SearchByCompanyHashDocument>,
    private readonly empresaService: EmpresaService,
  ) {}

  githubApiKEY = process.env.GITHUB_API_KEY;
  gitlabApiKEY = process.env.GITLAB_API_KEY;
  bitbucketUSERNAME = process.env.BITBUCKET_USERNAME;
  bitbucketPASSWORD = process.env.BITBUCKET_PASSWORD;

  async search(searchDto: ManualSearchDto): Promise<any> {
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

  async saveSearch(
    searchDto: ManualSearchDto,
    resultsLength: number,
  ): Promise<any> {
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
      };
    });

    return response;
  }

  async saveSearchWithoutEncryption(
    searchDto: ManualSearchDto,
    results: ResultWithoutMaliciousIntent[],
  ): Promise<any> {
    const search = new this.searchByCompanyHashModel({
      userId: searchDto.userId,
      name: searchDto.name,
      content: searchDto.content,
      registerDate: new Date(),
      response: results,
      length: results.length,
    });
    const savedSearchWithoutEncryption = await search.save();
    return savedSearchWithoutEncryption;
  }

  async searchByCompanyHash(empresaId: string, hash: string): Promise<any> {
    const empresa = await this.empresaService.findById(empresaId);

    if (!empresa) {
      throw new Error('Empresa not found');
    }

    if (!hash) {
      throw new Error('Hash is required');
    }

    if (empresa.hash !== hash) {
      throw new Error('The hash is not associated with the empresa');
    }
    const githubUrl = `https://api.github.com/search/code?q=${hash}`;
    const githubHeaders = {
      Authorization: `token ${this.githubApiKEY}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const githubResponse = await this.httpService
      .get(githubUrl, { headers: githubHeaders })
      .pipe(map((response) => response.data))
      .toPromise()
      .catch((err) => {
        console.error(err);
        return null;
      });

    if (!githubResponse || !githubResponse.items) {
      throw new Error('No items found in GitHub response');
    }

    const results: ResultWithoutMaliciousIntent[] = [];
    for (const item of githubResponse.items) {
      let content = await this.getCodeContent(item.git_url);
      content = Buffer.from(content, 'base64').toString('utf-8');
      results.push({
        filePath: item.path,
        codeContent: content,
        repositoryName: item.repository.full_name,
        repositoryUrl: item.repository.url,
        foundIn: 'github',
      });
    }

    const savedSearch = await this.saveSearchWithoutEncryption(
      {
        content: hash,
        userId: empresa._id,
        name: empresa.name,
      },
      results,
    );

    return {
      searchId: savedSearch._id,
      empresaName: empresa.name,
      hashBuscado: hash,
      dataDeVarredura: savedSearch.registerDate || new Date().toISOString(),
      quantidadeDeResultados: results.length,
      response: results,
      foundIn: results.map((r) => r.foundIn),
    };
  }

  async getRecentResults(days: number): Promise<SearchByCompanyHash[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const recentResults = await this.searchByCompanyHashModel
      .find({ registerDate: { $gte: startDate } })
      .exec();

    return recentResults;
  }
}
