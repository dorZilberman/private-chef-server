import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MongoClient } from 'mongodb';
import { IngredientsService } from './ingredients/ingredients.service';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Connect to MongoDB
  const mongoClient = await MongoClient.connect('mongodb://localhost:27017');
  const db = mongoClient.db('PrivateChefDB');
  const ingredientsService = app.get(IngredientsService);
  // Fetch data from external API
  let ingredients = await ingredientsService.getIngredientsFromCSV();
  // Save data to MongoDB
  const collection = db.collection('ingredients');
  await collection.insertMany(ingredients);

  const config = new DocumentBuilder()
    .setTitle('Private Chef API')
    .setDescription('')
    .setVersion('1.0')
    .addTag('recipe')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}

bootstrap();
