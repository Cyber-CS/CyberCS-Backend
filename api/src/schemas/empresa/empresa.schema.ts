import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmpresaDocument = Empresa & Document;

@Schema()
export class Empresa {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true }) // Alterar para um hash único
  hash: string; // Mudando de hashes: string[] para hash: string
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
