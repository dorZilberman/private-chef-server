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
    ) {}

    async toggleLikeComment(commentId: string, userId: string): Promise<{ status: string }> {
        const existingLike = await this.commentLikeModel.findOne({
            commentId: new Types.ObjectId(commentId),
            userId: new Types.ObjectId(userId),
        });

        if (existingLike) {
            await this.commentLikeModel.deleteOne({ _id: existingLike._id });
            return { status: 'unliked' }; // Indicate that the like was removed
        }

        const newLike = new this.commentLikeModel({
            commentId: new Types.ObjectId(commentId),
            userId: new Types.ObjectId(userId),
        });

        await newLike.save();
        return { status: 'liked' }; // Indicate that a new like was added
    }

    async toggleLikeRecipe(recipeId: string, userId: Types.ObjectId): Promise<{ status: string }> {
        const existingLike = await this.recipeLikeModel.findOne({
            recipeId: new Types.ObjectId(recipeId),
            userId: new Types.ObjectId(userId),
        });

        if (existingLike) {
            await this.recipeLikeModel.deleteOne({ _id: existingLike._id });
            return { status: 'unliked' }; // Indicate that the like was removed
        }

        const newLike = new this.recipeLikeModel({
            recipeId: new Types.ObjectId(recipeId),
            userId: new Types.ObjectId(userId),
        });

        await newLike.save();
        return { status: 'liked' }; // Indicate that a new like was added
    }
}
