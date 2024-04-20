import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RecipeService {
  constructor(private httpService: HttpService) { }

  async getRecipe(products: string[], allergies: string[]): Promise<string> {
    let query = 'please generate a recipe for me, ';
    if (products?.length) {
      query = query.concat('the ingredients I have are: ');
      for (const product of products) {
        query = query.concat(`${product}, `);
      }
    }

    if (allergies?.length) {
      query = query.concat('the alergies I have are: ');
      for (const allergie of allergies) {
        query = query.concat(`${allergie}, `);
      }
    }

    query = query.concat(`please write the answer as a json string so i can run JSON.parse() on that and get a vaild response,
    the keys in the json should be: 'title'(for the dish name), 'products'(as an array with amount needed for each product),
    'nutritional values' and 'instructions'(the instructions for the recipe itself)`);

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
    try {
      const response: AxiosResponse = await this.httpService.post(url, body).toPromise();
      const responstData = response.data;
      const textJson = responstData?.candidates[0]?.content.parts[0]?.text;
      const startIndex = textJson.indexOf('```json') + 7;
      const endIndex = textJson.lastIndexOf('```');
      const jsonString = textJson.substring(startIndex, endIndex).trim();
      const jsonData = JSON.parse(jsonString);
      return jsonData;
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      throw new Error('Failed to retrieve the recipe.');
    }
  }
}
