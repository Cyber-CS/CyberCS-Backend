import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';
import { Empresa, EmpresaSchema } from '../../schemas/empresa/empresa.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Empresa.name, schema: EmpresaSchema }]),
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
