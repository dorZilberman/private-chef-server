import { BadRequestException, Body, Controller, Get, Post, Put, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from 'src/dto/create-recipe.dto';
import { RecipeDto } from 'src/dto/recipe.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  // Generate a recipe based on ingredients and allergies
  @Post('generate')
  @UseGuards(AuthGuard)
  getRecipe(@Body() body: CreateRecipeDto, @Req() req): Promise<string> {
    const userId = req.user.userId;
    console.log('userId');
    console.log(userId);
    if (!Array.isArray(body?.ingredients) || !Array.isArray(body?.allergies)) {
      throw new BadRequestException('Missing input');
    }
    const { ingredients, allergies,isRegenerate, lastRecipeName } = body;
    return this.recipeService.getRecipe(ingredients, allergies, isRegenerate, lastRecipeName);
  }

  // Create a new recipe
  @Post()
  @UseGuards(AuthGuard)
  async createRecipe(@Body() createRecipeDto: RecipeDto, @Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.createRecipe(userId, createRecipeDto);
  }


  @Get("all")
  @UseGuards(AuthGuard)
  async getAllRecipes(@Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.getAllRecipes(userId);
  }

  // Get a recipe by ID (only if the user owns it)
  @Get(':id')
  @UseGuards(AuthGuard)
  async getRecipeById(@Param('id') id: string, @Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.getRecipeById(userId, id);
  }

  // Get all recipes for the logged-in user
  @Get()
  @UseGuards(AuthGuard)
  async getRecipesByUserId(@Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.getRecipesByUserId(userId);
  }

  // Update a recipe by ID (only if the user owns it)
  @Put(':id')
  @UseGuards(AuthGuard)
  async updateRecipe(
    @Param('id') id: string, 
    @Body() updateRecipeDto: RecipeDto, 
    @Req() req
  ): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.updateRecipe(userId, id, updateRecipeDto);
  }

  // Delete a recipe by ID (only if the user owns it)
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteRecipe(@Param('id') id: string, @Req() req): Promise<any> {
    const userId = req.user.userId;
    return this.recipeService.deleteRecipe(userId, id);
  }
}
