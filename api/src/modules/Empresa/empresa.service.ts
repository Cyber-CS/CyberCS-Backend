import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Empresa, EmpresaDocument } from '../../schemas/empresa/empresa.schema';
import { EmpresaDto } from 'src/dtos/EmpresaDto';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectModel(Empresa.name) private empresaModel: Model<EmpresaDocument>,
  ) {}

  async saveEmpresa(empresaDto: EmpresaDto): Promise<Empresa> {
    const newEmpresa = new this.empresaModel(empresaDto);
    return newEmpresa.save();
  }

  async findAll(): Promise<Empresa[]> {
    return this.empresaModel.find().exec();
  }

  async updateEmpresa(id: string, empresaDto: EmpresaDto): Promise<Empresa> {
    return this.empresaModel
      .findByIdAndUpdate(id, empresaDto, { new: true })
      .exec();
  }

  async deleteEmpresa(id: string): Promise<any> {
    const result = await this.empresaModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findById(id: string): Promise<Empresa> {
    return this.empresaModel.findById(id).exec();
  }
}
