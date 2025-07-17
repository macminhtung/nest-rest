import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ENV_CONFIGURATION, ENV_VALIDATION } from '@/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      load: [() => ENV_CONFIGURATION],
      validationSchema: ENV_VALIDATION,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
