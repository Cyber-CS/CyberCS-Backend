import { Controller, Get, Query } from '@nestjs/common';
import { HIBPService } from './hibp.service';

@Controller('hibp')
export class HIBPController {
  constructor(private readonly hibpService: HIBPService) {}

  @Get('check-account')
  async checkBreachedAccount(@Query('email') email: string) {
    return this.hibpService.checkBreachedAccount(email);
  }
}
