import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SearchDto } from '../../dtos/SearchDto';
import { map } from 'rxjs';
import { MaliciousIntentService } from 'src/modules/malicious-intent/malicious-intent.service';
import { Search, SearchDocument } from 'src/schemas/management/search.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EncryptionService } from '../encryption/encryption.service';
import { EmpresaService } from '../Empresa/empresa.service';
import { SearchByCompanyHash, SearchByCompanyHashDocument } from '../../schemas/management/search-by-company-hash.schema'; // Importando o novo schema

export type Result = {
  filePath: string;
  codeContent: string;
  repositoryName: string;
  repositoryUrl: string;
  maliciousIntent?: RegExp[];
  foundIn: string;
};

export type ResultWithoutMaliciousIntent = {
  filePath: string;
  codeContent: string;
  repositoryName: string;
  repositoryUrl: string;
  foundIn: string;
};

@Injectable()
export class SearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly maliciousIntentService: MaliciousIntentService,
    private readonly encryptionService: EncryptionService,
    @InjectModel(Search.name) private searchModel: Model<SearchDocument>,
    @InjectModel(SearchByCompanyHash.name) private searchByCompanyHashModel: Model<SearchByCompanyHashDocument>, // Injetando o novo modelo
    private readonly empresaService: EmpresaService,
  ) {}

  githubApiKEY = process.env.GITHUB_API_KEY;
  gitlabApiKEY = process.env.GITLAB_API_KEY;
  bitbucketUSERNAME = process.env.BITBUCKET_USERNAME;
  bitbucketPASSWORD = process.env.BITBUCKET_PASSWORD;

  async search(searchDto: SearchDto): Promise<any> {
    const results: Result[] = [];
    const githubUrl = `https://api.github.com/search/code?q=${searchDto.content}`;
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

    for (const item of githubResponse.items) {
      let content = await this.getCodeContent(item.git_url);
      content = Buffer.from(content, 'base64').toString('utf-8');
      const maliciousIntent = await this.maliciousIntentService.checkForMaliciousIntent(content);
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

    const savedSearch = await this.saveSearch(searchDto, results);
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

  async saveSearch(searchDto: SearchDto, results: Result[]): Promise<any> {
    const resultsEncrypted = this.encryptionService.encryptArray(results);
    const search = new this.searchModel({
      userId: searchDto.userId,
      name: searchDto.name,
      content: searchDto.content,
      filters: ['filter1', 'filter2'],
      registerDate: new Date(),
      response: resultsEncrypted,
      length: results.length,
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

  async findByUser(userId: string): Promise<Search[]> {
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

  async saveSearchWithoutEncryption(searchDto: SearchDto, results: Result[]): Promise<any> {
    const search = new this.searchByCompanyHashModel({ // Alterado para usar o novo modelo
      userId: searchDto.userId,
      name: searchDto.name,
      content: searchDto.content,
      filters: ['filter1', 'filter2'],
      registerDate: new Date(),
      response: results, // Aqui, estamos salvando os resultados sem encriptá-los
      length: results.length,
    });
    const savedSearchWithoutEncryption = await search.save();
    return savedSearchWithoutEncryption;
  }
  
  async searchByCompanyHash(empresaId: string, hash: string): Promise<any> {
    // Find the empresa by its ID
    const empresa = await this.empresaService.findById(empresaId);

    if (!empresa) {
      throw new Error('Empresa not found');
    }

    if (!hash) {
      throw new Error('Hash is required');
    }

    // Check if the hash is included in the empresa's hashes
    if (empresa.hash !== hash) {
      throw new Error('The hash is not associated with the empresa');
    }

    // Perform the search logic using the hash
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

    // Salvar os resultados sem criptografia
    const savedSearch = await this.saveSearchWithoutEncryption(
      {
          content: hash,
          userId: "SearchDto.userId", // Você deve substituir isso pelo userId correto
          name: "name" // Você deve substituir isso pelo nome correto
      },
      results // Certifique-se de passar o array de resultados aqui
    );

    return {
      searchId: savedSearch._id,
      empresaName: empresa.name, // Nome da empresa
      hashBuscado: hash, // O hash que foi buscado
      dataDeVarredura: savedSearch.registerDate || new Date().toISOString(), // Data de varredura
      quantidadeDeResultados: results.length, // Quantidade de resultados encontrados
      response: results,
      foundIn: results.map((r) => r.foundIn),
    };
  }

  async getRecentResults(days: number): Promise<SearchByCompanyHash[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days); // Define a data inicial de acordo com o número de dias

    // Buscar os registros na coleção 'search-by-company-hash'
    const recentResults = await this.searchByCompanyHashModel
      .find({ registerDate: { $gte: startDate } }) // Usando o operador $gte para encontrar registros recentes
      .exec();

    return recentResults;
  }

}
