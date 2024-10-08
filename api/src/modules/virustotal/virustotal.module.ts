import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Importa o HttpModule para fazer requisições HTTP
import { VirusTotalController } from './virustotal.controller';
import { VirusTotalService } from './virustotal.service';

@Module({
  imports: [HttpModule],
  controllers: [VirusTotalController],
  providers: [VirusTotalService],
})
export class VirusTotalModule {}
