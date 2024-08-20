import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikesController } from './likes.controller';
import { CommentLikeSchema } from 'src/schemas/comment-like.schema';
import { RecipeLikeSchema } from 'src/schemas/recipe-like.schema';
import { LikesService } from './likes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CommentLike', schema: CommentLikeSchema },
      { name: 'RecipeLike', schema: RecipeLikeSchema },
    ]),
  ],
  providers: [LikesService],
  controllers: [LikesController],
})
export class LikesModule {}