import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Result } from 'src/types/Result';
import { v4 as uuidv4 } from 'uuid';
export type MonitorAlertsDocument = MonitorAlerts & Document;

@Schema()
export class MonitorAlerts {
  @Prop({ default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  automaticsearchId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  registerDate: Date;

  @Prop({ required: true })
  response: Result[];
}

export const MonitorAlertsSchema = SchemaFactory.createForClass(MonitorAlerts);
