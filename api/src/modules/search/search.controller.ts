import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from '../../dtos/SearchDto';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @Post('search')
  async search(@Body() searchDto: SearchDto, @Res() res): Promise<any> {
    const response = await this.searchService.search(searchDto);
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }

  @Get('result')
  async result(@Res() res, @Query() query: {searchId: string} ): Promise<any> {
    const response = await this.searchService.findById(query.searchId);
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }
}
