import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { loadENVsFunc, ENV_VALIDATION } from '@/config';
import { ApiLoggingInterceptor } from '@/interceptors';
import { AuthGuard } from '@/guards';
import { ApiExceptionsFilter } from '@/filters';
import { ApiValidationPipe } from '@/pipes';
import { typeormConfig } from '@/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { TaskModule } from '@/modules/task/task.module';
import { ProjectModule } from '@/modules/project/project.module';
import { SharedModule } from '@/modules/shared/shared.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

@Module({
  imports: [
    // #=======================#
    // # ==> CONFIG MODULE <== #
    // #=======================#
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
      load: [loadENVsFunc],
      validationSchema: ENV_VALIDATION,
    }),

    // #=========================#
    // # ==> TYPE_ORM MODULE <== #
    // #=========================#
    TypeOrmModule.forRoot(typeormConfig),

    SharedModule,
    UserModule,
    TaskModule,
    ProjectModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // #===================================#
    // # ==> [INTERCEPTOR] API LOGGING <== #
    // #===================================#
    { provide: APP_INTERCEPTOR, useClass: ApiLoggingInterceptor },

    // #================================#
    // # ==> [FILTER] API EXCEPTION <== #
    // #================================#
    { provide: APP_FILTER, useClass: ApiExceptionsFilter },

    // #===============================#
    // # ==> [PIPE] API VALIDATION <== #
    // #===============================#
    { provide: APP_PIPE, useClass: ApiValidationPipe },

    // #====================================#
    // # ==> [GUARD] API AUTHENTICATION <== #
    // #====================================#
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
