import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('likes')
@UseGuards(AuthGuard)
export class LikesController {
    constructor(
        private readonly likesService: LikesService,
    ) { }

    @Post('comment/:id')
    async likeComment(@Param('id') commentId: string, @Req() req) {
        return this.likesService.toggleLikeComment(commentId, req.user.userId);
    }

    @Post('recipe/:id')
    async likePost(@Param('id') recipeId: string, @Req() req) {
        return this.likesService.toggleLikeRecipe(recipeId, req.user.userId);
    }
}
