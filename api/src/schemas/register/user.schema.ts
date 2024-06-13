import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  username: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
