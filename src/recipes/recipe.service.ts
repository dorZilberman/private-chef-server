import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe, RecipeDocument } from 'src/schemas/recipe.schema';
import { RecipeDto } from 'src/dto/recipe.dto';
import { User } from 'src/schemas/user.schema';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class RecipeService {
  constructor( @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>, private httpService: HttpService) {}

  async getRecipe(products: string[], allergies: string[]): Promise<string> {
    let query = 'please generate a recipe for me, ';
    if (products?.length) {
      query = query.concat('the ingredients I have are: ');
      for (const product of products) {
        query = query.concat(`${product}, `);
      }
    }

    if (allergies?.length) {
      query = query.concat('the allergies I have are: ');
      for (const allergy of allergies) {
        query = query.concat(`${allergy}, `);
      }
    }

    query = query.concat(`please write the answer as a json string so i can run JSON.parse() on that and get a valid response,
    the keys in the json should be: 'title'(for the dish name), 'products'(as an array with amount needed for each product),
    'nutritional values' and 'instructions'(the instructions for the recipe itself)`);

    let numOfRetries = 1;

    const apiKey = 'AIzaSyBcVOkOTe2EaJDzohefkuu_gjRnSq8-yGQ';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const body = {
      "contents": [
        {
          "parts": [
            {
              "text": query
            }
          ]
        }
      ]
    };

    while (numOfRetries <= 5) {
      try {
        const response: AxiosResponse = await this.httpService.post(url, body).toPromise();
        const responseData = response.data;
        const textJson = responseData?.candidates[0]?.content.parts[0]?.text;
        const startIndex = textJson.indexOf('```json') + 7;
        const endIndex = textJson.lastIndexOf('```');
        const jsonString = textJson.substring(startIndex, endIndex).trim();
        const jsonData = JSON.parse(jsonString);
        return jsonData;
      } catch (error) {
        if (numOfRetries === 5) {
          console.error('Failed to fetch recipe:', error);
          throw new Error('Failed to retrieve the recipe.');
        } else {
          console.log(`failed on attempt #${numOfRetries}, trying again`);
          numOfRetries++;
        }
      }
    } 
  }

  // Create a new recipe
  async createRecipe(userId: string, createRecipeDto: RecipeDto): Promise<Recipe> {
    const { title, products, nutritional_values, instructions } = createRecipeDto;
    const newRecipe = new this.recipeModel({
      userId,
      title,
      products,
      nutritional_values,
      instructions,
    });
    return newRecipe.save();
  }

  // Retrieve a recipe by ID, with user validation
  async getRecipeById(userId: string, id: string): Promise<Recipe> {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    if (recipe.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this recipe');
    }
    return recipe;
  }

  // Retrieve all recipes by user ID
  async getRecipesByUserId(userId: string): Promise<Recipe[]> {
    return this.recipeModel.find({ userId }).exec();
  }

  // Update a recipe by ID, with user validation
  async updateRecipe(userId: string, id: string, updateRecipeDto: RecipeDto): Promise<Recipe> {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    if (recipe.userId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this recipe');
    }

    const { title, products, nutritional_values, instructions } = updateRecipeDto;

    recipe.title = title ?? recipe.title;
    recipe.products = products ?? recipe.products;
    recipe.nutritional_values = nutritional_values ?? recipe.nutritional_values;
    recipe.instructions = instructions ?? recipe.instructions;

    return recipe.save();
  }

  // Delete a recipe by ID, with user validation
  async deleteRecipe(userId: string, id: string): Promise<boolean> {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    if (recipe.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this recipe');
    }

    const res = await recipe.deleteOne();
    return res.deletedCount === 1;
  }
}
