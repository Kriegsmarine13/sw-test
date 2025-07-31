import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/allExceptions.filter';
import { ValidationPipe } from '@nestjs/common';
// import { LoggerInterceptor } from './common/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Если нужен глобальный логгер, а не на отдельные контроллеры
  // app.useGlobalInterceptors(new LoggerInterceptor());

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
