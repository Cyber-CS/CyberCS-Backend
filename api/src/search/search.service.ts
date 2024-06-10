import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SearchDto } from './dtos/SearchDto';
import { map } from 'rxjs';

@Injectable()
export class SearchService {
  constructor(private readonly httpService: HttpService) {}

  async search(searchDto: SearchDto): Promise<any> {
    const apiKEY = '';
    const url = `https://api.github.com/search/code?q=hello`;
    const headers = {
      Authorization: `token ${apiKEY}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const response = this.httpService
      .get(url, { headers })
      .pipe(map((response) => response.data))
      .toPromise();

    return response;
  }
}
