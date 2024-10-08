import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type EmpresaDocument = Empresa & Document;

@Schema()
export class Empresa {
  @Prop({ default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  hash: string;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
