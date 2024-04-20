import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { RecipeService } from './recipe.service';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  getHello(@Body() body): Promise<string> {
    if (!body?.input) {
      throw new BadRequestException('missing input');
    }
    return this.recipeService.getRecipe(body.input);
  }
}
