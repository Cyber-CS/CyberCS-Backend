import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Result } from 'src/modules/search/search.service';
import { v4 as uuidv4 } from 'uuid';
export type SearchDocument = Search & Document;

@Schema()
export class Search {
  @Prop({ default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  filters: string[];

  @Prop({ required: true })
  registerDate: Date;

  @Prop()
  owner: string;

  @Prop()
  response: Result[];

  @Prop()
  length: number;
}

export const SearchSchema = SchemaFactory.createForClass(Search);