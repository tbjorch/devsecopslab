import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // VULNERABILITY #5 (continued): Security Misconfiguration
  // Enabling CORS for all origins without restrictions
  app.enableCors({
    origin: '*', // VULNERABLE: Allows all origins
    credentials: true, // Dangerous when combined with wildcard origin
  });

  // VULNERABILITY: Exposing detailed error messages in production
  // This would expose stack traces and sensitive information
  // app.useGlobalFilters(new AllExceptionsFilter()); // Missing error handling

  await app.listen(process.env.PORT ?? 3000);

  // VULNERABILITY: Logging sensitive information
  console.log('Application started on port', process.env.PORT ?? 3000);
  console.log('Database connection:', process.env.DATABASE_URL);
  console.log(
    'API Keys loaded:',
    Object.keys(process.env).filter((k) => k.includes('KEY')),
  );
}
bootstrap();
