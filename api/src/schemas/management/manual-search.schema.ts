import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Result } from 'src/types/Result';
import { v4 as uuidv4 } from 'uuid';
export type ManualSearchDocument = ManualSearch & Document;

@Schema()
export class ManualSearch {
  @Prop({ default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  registerDate: Date;

  @Prop()
  response: Result[];

  @Prop()
  length: number;
}

export const SearchSchema = SchemaFactory.createForClass(ManualSearch);
