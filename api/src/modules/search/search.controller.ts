import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from '../../dtos/SearchDto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @Post()
  async search(@Body() searchDto: SearchDto, @Res() res): Promise<any> {
    const response = await this.searchService.search(searchDto);
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }
}
