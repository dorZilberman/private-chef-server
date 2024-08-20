import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecipeLikeDocument = RecipeLike & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: false } })
export class RecipeLike {

    @Prop({ type: Types.ObjectId, ref: 'Recipe', required: true })
    recipeId: Types.ObjectId;
  
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

}

export const RecipeLikeSchema = SchemaFactory.createForClass(RecipeLike);
