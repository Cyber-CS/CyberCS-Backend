import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Result } from 'src/types/Result';
import { v4 as uuidv4 } from 'uuid';
export type AutomaticSearchDocument = AutomaticSearch & Document;

@Schema()
export class AutomaticSearch {
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

  @Prop({ required: true })
  periodicity: string;

  @Prop({ required: true })
  isAlive: boolean;
}

export const AutomaticSearchSchema =
  SchemaFactory.createForClass(AutomaticSearch);
