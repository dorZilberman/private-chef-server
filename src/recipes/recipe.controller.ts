import { BadRequestException, Body, Controller, Get, Post, Put, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from 'src/dto/create-recipe.dto';
import { RecipeDto } from 'src/dto/recipe.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('recipe')
@UseGuards(AuthGuard)
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  // Generate a recipe based on ingredients and allergies
  @Post('generate')
  getRecipe(@Body() body: CreateRecipeDto, @Req() req): Promise<string> {
    const userId = req.user.userId;
    if (!Array.isArray(body?.ingredients) || !Array.isArray(body?.allergies)) {
      throw new BadRequestException('Missing input');
    }
    const { ingredients, allergies,isRegenerate, lastRecipeName } = body;
    return this.recipeService.getRecipe(ingredients, allergies, isRegenerate, lastRecipeName);
  }

  // Create a new recipe
  @Post()
  async createRecipe(@Body() createRecipeDto: RecipeDto, @Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.createRecipe(userId, createRecipeDto);
  }


  @Get("all")
  @UseGuards(AuthGuard)
  async getAllRecipes(@Req() req): Promise<any> {
    const userId = req.user.userId;
    const recipes =  await this.recipeService.getAllRecipes(userId);
    return recipes
  }

  // Get a recipe by ID (only if the user owns it)
  @Get(':id')
  async getRecipeById(@Param('id') id: string, @Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.getRecipeById(userId, id);
  }

  // Get all recipes for the logged-in user
  @Get()
  async getRecipesByUserId(@Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.getRecipesByUserId(userId);
  }

  // Update a recipe by ID (only if the user owns it)
  @Put(':id')
  async updateRecipe( @Param('id') id: string, @Body() updateRecipeDto: RecipeDto, @Req() req ): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.updateRecipe(userId, id, updateRecipeDto);
  }

  // Delete a recipe by ID (only if the user owns it)
  @Delete(':id')
  async deleteRecipe(@Param('id') id: string, @Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.deleteRecipe(userId, id);
  }
}
