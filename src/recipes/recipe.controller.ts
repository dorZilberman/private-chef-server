import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { RecipeService } from './recipe.service';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  getHello(@Body() body: { ingredients: string[], allergies: string[]}): Promise<string> {
    if (!Array.isArray(body?.ingredients) || !Array.isArray(body.allergies)) {
      throw new BadRequestException('missing input');
    }
    const { ingredients, allergies } = body;
    return this.recipeService.getRecipe(ingredients, allergies);
  }
}
