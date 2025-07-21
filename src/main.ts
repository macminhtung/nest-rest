import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.disable('x-powered-by'); // Remove x-powered-by header
  app.enableCors(); // Enable CORS

  // #============================#
  // # ==> APIs DOCUMENTATION <== #
  // #============================#
  const config = new DocumentBuilder().setTitle('APIs Documentation').addBearerAuth().build();
  SwaggerModule.setup('documentation', app, () => SwaggerModule.createDocument(app, config));

  // #===========================#
  // # ==> START APPLICATION <== #
  // #===========================#
  const { PORT = 3001 } = process.env;
  await app.listen(parseInt(`${PORT}`));
  const logger = app.get(Logger);
  logger.debug(
    `==> APP IS RUNNING | PORT: ${PORT} <== [http://localhost:${PORT}/documentation]`,
    'APPLICATION',
  );
}
bootstrap();
