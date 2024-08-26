import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return await this.commentsService.create(createCommentDto, req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return await this.commentsService.getCommentsWithLikes(id, req.user.userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req) {
    const comment = await this.commentsService.findOne(id);

    if (comment.userId !== req.user.userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return await this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const comment = await this.commentsService.findOne(id);

    if (comment.userId !== req.user.userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return await this.commentsService.remove(id);
  }
}
