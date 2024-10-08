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

  @Prop({ type: [String], required: true })
  filters: string[];

  @Prop({ required: true })
  registerDate: Date;

  @Prop({ type: [Object], required: true })
  response: any[];

  @Prop({ required: true })
  length: number;
}

export const SearchByCompanyHashSchema =
  SchemaFactory.createForClass(SearchByCompanyHash);
