import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SearchByCompanyHashDocument = SearchByCompanyHash & Document;

@Schema()
export class SearchByCompanyHash {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], required: true }) // Filtros como um array de strings
  filters: string[];

  @Prop({ required: true })
  registerDate: Date;

  @Prop({ type: [Object], required: true }) // Resposta como um array de objetos
  response: any[];

  @Prop({ required: true })
  length: number;
}

export const SearchByCompanyHashSchema = SchemaFactory.createForClass(SearchByCompanyHash);
