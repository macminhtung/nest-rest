import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { loadENVsFunc, ENV_VALIDATION } from '@/config';
import { APILoggingInterceptor } from '@/interceptors';
import { AuthGuard } from '@/guards';
import { APIExceptionsFilter } from '@/filters';
import { APIValidationPipe } from '@/pipes';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { ProductModule } from '@/modules/product/product.module';
import { SharedModule } from '@/modules/shared/shared.module';

@Module({
  imports: [
    // #=======================#
    // # ==> CONFIG MODULE <== #
    // #=======================#
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [loadENVsFunc],
      validationSchema: ENV_VALIDATION,
    }),

    // #=========================#
    // # ==> TYPE_ORM MODULE <== #
    // #=========================#
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => await configService.get('database')!,
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource({
          entities: ['dist/**/*.entity{.ts,.js}'],
          migrations: ['dist/migrations/*{.ts,.js}'],
          type: 'postgres',
          migrationsRun: false,
          synchronize: true,
          namingStrategy: new SnakeNamingStrategy(),
          logging: false,
          ...options,
        });

        await dataSource.initialize();
        await dataSource.runMigrations();
        return dataSource;
      },
    }),

    SharedModule,
    UserModule,
    AuthModule,
    ProductModule,
  ],
  providers: [
    // #===================================#
    // # ==> [INTERCEPTOR] API LOGGING <== #
    // #===================================#
    { provide: APP_INTERCEPTOR, useClass: APILoggingInterceptor },

    // #================================#
    // # ==> [FILTER] API EXCEPTION <== #
    // #================================#
    { provide: APP_FILTER, useClass: APIExceptionsFilter },

    // #===============================#
    // # ==> [PIPE] API VALIDATION <== #
    // #===============================#
    { provide: APP_PIPE, useClass: APIValidationPipe },

    // #====================================#
    // # ==> [GUARD] API AUTHENTICATION <== #
    // #====================================#
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
