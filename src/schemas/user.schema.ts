import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: false } })
export class User {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String] })
  tokens: string[];

  @Prop({ default: Date.now })
  created: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
