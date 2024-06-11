import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SearchDto } from './dtos/SearchDto';
import { map } from 'rxjs';

type Result = {
  filePath: string;
  codeContent: string;
  repositoryName: string;
  repositoryUrl: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly httpService: HttpService) {}
  apiKEY = '';

  async search(searchDto: SearchDto): Promise<any> {
    const url = `https://api.github.com/search/code?q=curitibaaa`;
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
      results.push({
        filePath: item.path,
        codeContent: a,
        repositoryName: item.repository.full_name,
        repositoryUrl: item.repository.url,
      });
    }
    return results;
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

  // async getRepoCreationDate(owner: string, repo: string, token: string): Promise<string> {
  //   const url = `https://api.github.com/repos/${owner}/${repo}`;
  //   const headers = {
  //     'Authorization': `token ${token}`,
  //     'Accept': 'application/vnd.github.v3+json',
  //   };

  //   return this.httpService.get(url, { headers }).pipe(
  //     map(response => response.data.created_at)
  //   ).toPromise();
  // }

}
