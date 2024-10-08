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
import { SaveSearchDto } from 'src/dtos/SaveSearchDto';

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
  async result(@Res() res, @Query() query: { searchId: string }): Promise<any> {
    const response = await this.searchService.findById(query.searchId);
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }

  @Get('manual-results-by-user')
  async resultsByUser(
    @Res() res,
    @Query() query: { userId: string },
  ): Promise<any> {
    const response = await this.searchService.searchByUser(query.userId);
    const jsonResponse = JSON.stringify(response);
    return res.status(HttpStatus.OK).send(jsonResponse);
  }

  @Post('search-by-hash')
  async searchByCompanyHash(
    @Body('empresaId') empresaId: string,
    @Body('hash') hash: string,
    @Res() res,
  ): Promise<any> {
    const response = await this.searchService.searchByCompanyHash(
      empresaId,
      hash,
    );
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('save-search')
  async saveSearch(
    @Body() saveSearchDto: SaveSearchDto,
    @Res() res,
  ): Promise<any> {
    
    const results = []; 

    const response = await this.searchService.saveSearchWithoutEncryption(
      saveSearchDto,
      results,
    );
    return res.status(HttpStatus.CREATED).json(response);
  }

  @Get('recent-results')
  async getRecentResults(
    @Res() res,
    @Query('days') days: number,
  ): Promise<any> {
    const results = await this.searchService.getRecentResults(days);
    return res.status(HttpStatus.OK).json(results); 
  }
}
