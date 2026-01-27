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
import { SharedModule } from '@/modules/shared/shared.module';
import { ProductModule } from '@/modules/product/product.module';
import { CartModule } from '@/modules/cart/cart.module';
import { ElasticModule } from '@/modules/elastic/elastic.module';
import { RedisCacheModule } from '@/modules/redis-cache/redis-cache.module';
import { GatewayModule } from '@/modules/gateway/gateway.module';
import { BullMQModule } from '@/modules/bullmq/bullmq.module';
import { PaymentModule } from '@/modules/payment/payment.module';

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

    // #==============================#
    // # ==> ELASTICSEARCH MODULE <== #
    // #==============================#
    ElasticModule,

    // #============================#
    // # ==> REDIS CACHE MODULE <== #
    // #============================#
    RedisCacheModule,

    // #=========================#
    // # ==> TYPE_ORM MODULE <== #
    // #=========================#
    TypeOrmModule.forRoot(typeormConfig),

    // #========================#
    // # ==> GATEWAY MODULE <== #
    // #========================#
    GatewayModule,

    // #=======================#
    // # ==> BULLMQ MODULE <== #
    // #=======================#
    BullMQModule,

    // #========================#
    // # ==> PAYMENT MODULE <== #
    // #========================#
    PaymentModule,

    SharedModule,
    UserModule,
    AuthModule,
    ProductModule,
    CartModule,
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
