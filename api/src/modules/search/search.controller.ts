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
import { SaveSearchDto } from 'src/dtos/SaveSearchDto';

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

  @Get('results-by-user')
  async resultsByUser(@Res() res, @Query() query: {userId: string} ): Promise<any> {
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
    const response = await this.searchService.searchByCompanyHash(empresaId, hash);
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('save-search')
  async saveSearch(@Body() saveSearchDto: SaveSearchDto, @Res() res): Promise<any> {
      // Adicione um array de resultados (results) aqui.
      const results = []; // Aqui você precisa obter os resultados apropriados.
      
      const response = await this.searchService.saveSearchWithoutEncryption(saveSearchDto, results);
      return res.status(HttpStatus.CREATED).json(response);
  }

  @Get('recent-results')
  async getRecentResults(@Res() res, @Query('days') days: number): Promise<any> {
    const results = await this.searchService.getRecentResults(days);
    return res.status(HttpStatus.OK).json(results); // Aqui estamos retornando os resultados do schema 'search-by-company-hash'
  }

}
