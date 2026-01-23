import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import type { TEnvConfiguration } from '@/config';

@Injectable()
export class StripeService {
  constructor(private configService: ConfigService<TEnvConfiguration>) {
    this.stripe = new Stripe(
      this.configService.get<TEnvConfiguration['stripe']>('stripe')!.secretKey,
      { apiVersion: '2025-12-15.clover' },
    );
  }

  public readonly stripe: Stripe;
}
