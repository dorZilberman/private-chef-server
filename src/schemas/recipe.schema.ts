import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: false } })
export class Recipe {

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String] })
  products: string[];

  @Prop({ type: [String] })
  nutritional_values: string[];

  @Prop({ type: [String] })
  instructions: string[];

  @Prop({ default: Date.now })
  created: Date;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
