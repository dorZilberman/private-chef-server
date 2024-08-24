import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MongoClient } from 'mongodb';
import { IngredientsService } from './ingredients/ingredients.service';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as forge from 'node-forge';

dotenv.config({ path: './environment.env' });

console.log('Environment variables loaded:');
console.log('JWT_SECRET_TOKEN:', process.env.JWT_SECRET_TOKEN);
console.log('JWT_SECRET_REFRESH_TOKEN:', process.env.JWT_SECRET_REFRESH_TOKEN);

const jwtSecret = process.env.JWT_SECRET_TOKEN;
const jwtRefreshTokenSecret = process.env.JWT_SECRET_REFRESH_TOKEN;

if (!jwtSecret || !jwtRefreshTokenSecret) {
  throw new Error('JWT secret keys must be defined in environment variables');
}

async function bootstrap() {

  const keyPath = 'key.pem';
  const certPath = 'cert.pem';

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('Generating SSL key and certificate...');
    await generateSslCertificates(keyPath, certPath);
    console.log('SSL key and certificate generated successfully.');
  }
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors();

  try {
    // Connect to MongoDB
    const mongoClient = await MongoClient.connect('mongodb://localhost:27017', {});
    const db = mongoClient.db('PrivateChefDB');
    const ingredientsService = app.get(IngredientsService);

    // Fetch data from external API
    const ingredients = await ingredientsService.getIngredientsFromCSV();

    // Prepare bulk operations
    const bulkOps = ingredients.map((ingredient) => ({
      updateOne: {
        filter: { id: ingredient.id }, // Assuming 'name' is the unique field
        update: { $set: ingredient },
        upsert: true, // Insert if not already present
      },
    }));

// Execute bulk operations
  const collection = db.collection('ingredients');
  await collection.bulkWrite(bulkOps);
  } catch (error) {
    console.error('Error connecting to MongoDB or fetching data:', error);
    process.exit(1);
  }

  const config = new DocumentBuilder()
    .setTitle('Private Chef API')
    .setDescription('')
    .setVersion('1.0')
    .addTag('recipe')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(433);
}


async function generateSslCertificates(keyPath: string, certPath: string) {
  const pki = forge.pki;
  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const pemKey = pki.privateKeyToPem(keys.privateKey);
  const pemCert = pki.certificateToPem(cert);

  fs.writeFileSync(keyPath, pemKey);
  fs.writeFileSync(certPath, pemCert);
}


bootstrap();
