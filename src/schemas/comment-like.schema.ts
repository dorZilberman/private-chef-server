import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentLikeDocument = CommentLike & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: false } })
export class CommentLike {

    @Prop({ type: Types.ObjectId, ref: 'Comment', required: true })
    commentId: Types.ObjectId;
  
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
