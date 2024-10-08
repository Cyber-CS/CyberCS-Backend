import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaDto } from 'src/dtos/EmpresaDto';

@Controller('empresas') 
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post('register')
  async saveEmpresa(@Body() empresaDto: EmpresaDto, @Res() res): Promise<any> {
    const savedEmpresa = await this.empresaService.saveEmpresa(empresaDto);
    return res.status(HttpStatus.CREATED).json(savedEmpresa);
  }

  @Get('all')
  async findAll(@Res() res): Promise<any> {
    const empresas = await this.empresaService.findAll();
    return res.status(HttpStatus.OK).json(empresas);
  }

  @Put('edit/:id')
  async updateEmpresa(
    @Param('id') id: string,
    @Body() empresaDto: EmpresaDto,
    @Res() res,
  ): Promise<any> {
    const updatedEmpresa = await this.empresaService.updateEmpresa(id, empresaDto);
    return res.status(HttpStatus.OK).json(updatedEmpresa);
  }

  @Delete('delete/:id')
  async deleteEmpresa(@Param('id') id: string, @Res() res): Promise<any> {
    const result = await this.empresaService.deleteEmpresa(id);
    if (!result) {
      return res.status(HttpStatus.NOT_FOUND).json({ message:'Empresa não encontrada'});
    }
    return res.status(HttpStatus.OK).json({ message: 'Deletado com sucesso'});
  }
}
