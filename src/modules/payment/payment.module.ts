import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { TEnvConfiguration } from '@/config';
import { PaymentService } from '@/modules/payment/payment.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    PaymentService,
    {
      inject: [ConfigService],
      provide: Stripe,
      useFactory: (configService: ConfigService<TEnvConfiguration>) =>
        new Stripe(configService.get<TEnvConfiguration['stripe']>('stripe')!.secretKey),
    },
  ],
  exports: [PaymentService, Stripe],
})
export class PaymentModule {}
