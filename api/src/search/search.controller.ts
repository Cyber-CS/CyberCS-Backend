import { Body, Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dtos/SearchDto';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}
  @Get()
  async search(@Body() searchDto: SearchDto, @Res() res): Promise<any> {
    const response = await this.searchService.search(searchDto);
    return res.status(HttpStatus.OK).json(response);
  }
}
