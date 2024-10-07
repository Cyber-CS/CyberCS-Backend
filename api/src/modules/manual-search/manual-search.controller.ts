import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { ManualSearchService } from './manual-search.service';
import { ManualSearchDto } from '../../dtos/ManualSearchDto';

@Controller()
export class SearchController {
  constructor(private readonly searchService: ManualSearchService) {}
  @Post('search')
  async search(@Body() searchDto: ManualSearchDto, @Res() res): Promise<any> {
    const response = await this.searchService.search(searchDto);
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }

  @Get('manual-result')
  async result(@Res() res, @Query() query: {searchId: string} ): Promise<any> {
    const response = await this.searchService.findById(query.searchId);
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }

  @Get('manual-results-by-user')
  async resultsByUser(@Res() res, @Query() query: {userId: string} ): Promise<any> {
    const response = await this.searchService.searchByUser(query.userId);
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }
}
