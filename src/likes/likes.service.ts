// likes.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentLike } from 'src/schemas/comment-like.schema';
import { RecipeLike } from 'src/schemas/recipe-like.schema';

@Injectable()
export class LikesService {
    constructor(
        @InjectModel('CommentLike') private readonly commentLikeModel: Model<CommentLike>,
        @InjectModel('RecipeLike') private readonly recipeLikeModel: Model<RecipeLike>,
    ) { }

    async likeComment(commentId: string, userId: string): Promise<CommentLike> {
        const like = new this.commentLikeModel({
            commentId: new Types.ObjectId(commentId),
            userId: new Types.ObjectId(userId)
        });
        return await like.save();
    }

    async likeRecipe(recipeId: string, userId: Types.ObjectId): Promise<RecipeLike> {
        const like = new this.recipeLikeModel({
            recipeId: new Types.ObjectId(recipeId),
            userId: new Types.ObjectId(userId)
        });
        return await like.save();
    }
}
