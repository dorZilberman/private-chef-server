import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument } from 'src/schemas/comment.schema';
import { Comment } from 'src/schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) { }
  async create(createCommentDto: CreateCommentDto, userId: string) {
    try {
      const newComment = new this.commentModel({
        userId: new Types.ObjectId(userId),
        recipeId: new Types.ObjectId(createCommentDto.recipeId),
        comment: createCommentDto.comment
      });
      return await newComment.save();
    }
    catch (error) {
      console.log(userId);
      console.log(createCommentDto);
      console.error(error.message, error.stack);
      throw new HttpException('Error commenting', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getComments(recipeId: string) {
    const objectId = new Types.ObjectId(recipeId);
    return await this.commentModel.find({ recipeId: objectId });
  }

  async getCommentsWithLikes(recipeId: string, userId: string) {
    const objectId = new Types.ObjectId(recipeId);
    const userObjectId = new Types.ObjectId(userId);

    const commentsWithLikes = await this.commentModel.aggregate([
      { $match: { recipeId: objectId } },

      {
        $lookup: {
          from: 'commentlikes',
          localField: '_id',
          foreignField: 'commentId',
          as: 'likes',
        },
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          alreadyLiked: {
            $in: [userObjectId, '$likes.userId'],
          },
        },
      },
      {
        $project: {
          likes: 0,
        },
      },
    ]);

    return commentsWithLikes;
  }
}
