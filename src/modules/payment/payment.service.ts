import { Injectable, HttpStatus, NotFoundException, ConflictException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import type { TEnvConfiguration } from '@/config';
import { UserEntity } from '@/modules/user/user.entity';
import { UserService } from '@/modules/user/user.service';
import { ERROR_MESSAGES } from '@/common/constants';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService<TEnvConfiguration>,

    private readonly userService: UserService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<TEnvConfiguration['stripe']>('stripe')!.secretKey,
      { apiVersion: '2025-12-15.clover' },
    );
  }

  private readonly stripe: Stripe;

  // #===============================#
  // # ==> CREATE PAYMENT METHOD <== #
  // #===============================#
  async createPaymentMethod(user: UserEntity, paymentMethodId: string) {
    let deleteCustomerFunc = () => Stripe.CustomersResource['del'];
    let newPaymentCustomer: Stripe.Customer;

    // Start transaction
    const queryRunner = this.userService.dataSource.createQueryRunner();
    await this.userService.handleTransactionAndRelease({
      queryRunner,
      processFunc: async () => {
        // Create new paymentCustomer
        if (user.paymentCustomerId) {
          const { id, email, firstName, lastName } = user;

          // Create the newPaymentCustomer
          newPaymentCustomer = await this.stripe.customers.create({
            email,
            name: `${firstName} ${lastName}`,
            metadata: { userId: id },
          });

          // Update the paymentCustomerId in the DB
          await queryRunner.manager.update(UserEntity, id, {
            paymentCustomerId: newPaymentCustomer.id,
          });

          // Update deleteCustomerFunc
          deleteCustomerFunc = () => this.stripe.customers.del(newPaymentCustomer!.id);
        }

        // Identify the paymentCustomerId
        const paymentCustomerId = user.paymentCustomerId || newPaymentCustomer.id;

        // Get all paymentMethods belong to customer
        const paymentMethods = await this.stripe.paymentMethods.list({
          customer: paymentCustomerId,
          limit: 100,
        });

        // Get the payment method information will be attach
        const attachPaymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

        // Check the card duplication
        const duplicatedCard = paymentMethods.data.find(
          (item) => item.card?.fingerprint === attachPaymentMethod.card?.fingerprint,
        );

        // CASE: Duplicates
        if (duplicatedCard) throw new ConflictException({ message: ERROR_MESSAGES.ALREADY_EXISTS });

        // Attach paymentMethod to paymentCustomer
        await this.stripe.paymentMethods.attach(paymentMethodId, { customer: paymentCustomerId });
      },
      rollbackFunc: () => deleteCustomerFunc(),
    });

    return HttpStatus.OK;
  }

  // #===============================#
  // # ==> DETACH PAYMENT METHOD <== #
  // #===============================#
  async detachPaymentMethod(user: UserEntity, paymentMethodId: string) {
    // Get all paymentMethods belong to customer
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: user.paymentCustomerId,
      limit: 100,
    });

    // Case: The paymentMethodId is not found
    if (!paymentMethods.data.find((item) => item.id === paymentMethodId))
      throw new NotFoundException({ message: ERROR_MESSAGES.NOT_FOUND });

    // Detach the paymentMethod
    await this.stripe.paymentMethods.detach(paymentMethodId);

    return HttpStatus.OK;
  }

  // #==============================#
  // # ==> LIST PAYMENT METHODS <== #
  // #==============================#
  async listPaymentMethods(user: UserEntity) {
    // List paymentMethods based on paymentCustomerId
    const stripePaymentMethods = await this.stripe.paymentMethods.list({
      customer: user.paymentCustomerId,
      limit: 100,
    });

    // Format paymentMethods
    const paymentMethods = stripePaymentMethods.data.map(({ id, card }) => ({
      id,
      last4: card?.last4,
      brand: card?.brand,
      expMonth: card?.exp_month,
      expYear: card?.exp_year,
    }));

    return paymentMethods;
  }
}
