import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument } from 'src/schemas/comment.schema';
import { Comment } from 'src/schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    try {
      const newComment = new this.commentModel({
        userId: new Types.ObjectId(userId),
        recipeId: new Types.ObjectId(createCommentDto.recipeId),
        comment: createCommentDto.comment,
      });
      return await newComment.save();
    } catch (error) {
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
   userIdObjectId: { $toObjectId: '$userId' },
    },
 },
      {
        $lookup: {
          from: 'users',
          localField: 'userIdObjectId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          alreadyLiked: {
            $in: [userObjectId, '$likes.userId'],
          },
          userName: { $arrayElemAt: ['$user.fullName', 0] },
        },
      },
      {
        $project: {
          likes: 0,
          userIdObjectId: 0,
          user: 0,
        },
      },
    ]);

    return commentsWithLikes;
  }

  async findOne(id: string): Promise<CommentDocument> {
    const objectId = new Types.ObjectId(id);
    const comment = await this.commentModel.findById(objectId);
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<CommentDocument> {
    const objectId = new Types.ObjectId(id);
    const updatedComment = await this.commentModel.findByIdAndUpdate(objectId, updateCommentDto, {
      new: true,
    });
    if (!updatedComment) {
      throw new HttpException('Comment not found or not updated', HttpStatus.NOT_FOUND);
    }
    return updatedComment;
  }

  async remove(id: string): Promise<void> {
    const objectId = new Types.ObjectId(id);
    const result = await this.commentModel.findByIdAndDelete(objectId);
    if (!result) {
      throw new HttpException('Comment not found or not deleted', HttpStatus.NOT_FOUND);
    }
  }
}
