import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { VirusTotalService } from './virustotal.service';

@Controller('virus-total')
export class VirusTotalController {
  constructor(private readonly virusTotalService: VirusTotalService) {}

  @Post('scan')
  async scanURL(@Body('url') url: string) {
    try {
      return await this.virusTotalService.scanURL(url);
    } catch (error) {
      console.error('Error in scanURL endpoint:', error.message);
      throw error;
    }
  }

  @Post('report')
  async getReport(@Body('resource') resource: string) {
    try {
      return await this.virusTotalService.getReport(resource);
    } catch (error) {
      console.error('Error in getReport endpoint:', error.message);
      throw error;
    }
  }

  @Get('domain-info')
  async domainInfo(@Query('domain') domain: string) {
    try {
      return await this.virusTotalService.domainInfo(domain);
    } catch (error) {
      console.error('Error in domainInfo endpoint:', error.message);
      throw error;
    }
  }
}
