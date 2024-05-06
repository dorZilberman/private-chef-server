import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IngredientDocument = Ingredient & Document;

@Schema()
export class Ingredient extends Document {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    name: string;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);