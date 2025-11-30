import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { ACCESS_TOKEN_HEADER_KEY } from '@/guards';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: process.env.APP_URI, credentials: true });
  app.use(cookieParser());

  // #============================#
  // # ==> APIs DOCUMENTATION <== #
  // #============================#
  const config = new DocumentBuilder()
    .setTitle('APIs Documentation')
    .addApiKey(
      { type: 'apiKey', name: ACCESS_TOKEN_HEADER_KEY, in: 'header' },
      ACCESS_TOKEN_HEADER_KEY,
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  // #===========================#
  // # ==> START APPLICATION <== #
  // #===========================#
  const { NODE_ENV, PORT = 3001 } = process.env;
  await app.listen(parseInt(`${PORT}`));
  const logger = app.get(Logger);
  if (NODE_ENV === 'development') {
    logger.debug(`==> INITIALIZED [http://localhost:${PORT}/documentation]`, 'APPLICATION');
  }
}
bootstrap();
