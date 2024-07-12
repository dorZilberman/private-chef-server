import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ingredient, IngredientDocument } from './ingredients.schema';
import { IngredientType } from 'src/entities/ingredient.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class IngredientsService {

  static genAI = new GoogleGenerativeAI('AIzaSyBcVOkOTe2EaJDzohefkuu_gjRnSq8-yGQ');

  constructor(private httpService: HttpService,
    @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>
  ) { }

  async getIngredients(): Promise<Ingredient[]> {
    return this.ingredientModel.find().exec();
  }

  async getIngredientsFromCSV(): Promise<IngredientType[]> {
    const ingredients: IngredientType[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream('./top-1k-ingredients.csv')
        .pipe(csv({ separator: ';', headers: ['name', 'id'] }))
        .on('data', (row) => {
          const ingredient: IngredientType = {
            id: row.id,
            name: row.name,
          };
          ingredients.push(ingredient);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
          resolve(ingredients);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Fetch data from external API
  async getIngredientsFromExternalAPI(): Promise<IngredientType[]> {

    const app_id = '842f706c';
    const app_key = '4bb973828c699cad723e4ca5e3a0f9f5';
    let allData = []
    let limitReached = false

    try {
      let nextPageUrl = "https://api.edamam.com/api/food-database/v2/parser?app_id=842f706c&app_key=4bb973828c699cad723e4ca5e3a0f9f5";

      while (nextPageUrl && !limitReached) {
        const response = await this.httpService.get<any>(nextPageUrl).toPromise(); // Await the response
        const responseData = response.data;
        responseData.hints.forEach(element => {
          const ingredient: IngredientType = {
            id: element.food.foodId,
            name: element.food.label,
          };
          allData.push(ingredient);
        });
        nextPageUrl = responseData._links?.next?.href;
      }
    }
    catch (error) {
      limitReached = true;
      console.error('Failed to fetch ingredients:', error);
    }
    finally {
      return Promise.resolve(allData);
    }

  }

  async getIngredientsFromImage(file: Express.Multer.File): Promise<Ingredient[]> {
    const model = IngredientsService.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "write me ONLY all the food ingredients in this image, separate by comma, and nothing else";
    const image = {
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    const result = await model.generateContent([prompt, image]);
    const ingredients = result.response.text().split(',').map(ingredient => ingredient.trim())
    const docs = await this.ingredientModel.find({ name: { $in: ingredients } }).exec();
    const uniqueDocsMap: Map<string, Ingredient> = docs.reduce((map, doc) => map.set(doc.name, doc), new Map());    
    const uniqueDocs: Ingredient[] = Array.from(uniqueDocsMap.values());

    return uniqueDocs;
  }

}
