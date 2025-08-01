import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { loadENVsFunc, ENV_VALIDATION } from '@/config';
import { ApiLoggingInterceptor } from '@/interceptors';
import { AuthGuard } from '@/guards';
import { ApiExceptionsFilter } from '@/filters';
import { ApiValidationPipe } from '@/pipes';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { ProductModule } from '@/modules/product/product.module';
import { SharedModule } from '@/modules/shared/shared.module';
import { ElasticModule } from '@/modules/elastic/elastic.module';
import type { TEnvConfiguration } from '@/config';

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

    // #==============================#
    // # ==> ELASTICSEARCH MODULE <== #
    // #==============================#
    ElasticModule,

    // #=========================#
    // # ==> TYPE_ORM MODULE <== #
    // #=========================#
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<TEnvConfiguration>) =>
        await configService.get('database')!,
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
