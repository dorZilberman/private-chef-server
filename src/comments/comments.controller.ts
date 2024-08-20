import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { error } from 'console';

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return await this.commentsService.create(createCommentDto, req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentsService.getComments(id);
  }
}
