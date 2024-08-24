import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: false } })
export class Recipe {

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: []})
  products: { amount: string; name: string }[];

  @Prop({ type: [String], default: [] })
  nutritional_values: string[];

  @Prop({ default: "" })
  imageURL: string;

  @Prop({ type: [String] })
  instructions: string[];

  @Prop({ default: Date.now })
  created: Date;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
