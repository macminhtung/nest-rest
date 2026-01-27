import {
  Injectable,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { UserEntity } from '@/modules/user/user.entity';
import { ERROR_MESSAGES } from '@/common/constants';
import { CartItemEntity } from '@/modules/cart/cart-item/cart-item.entity';

@Injectable()
export class PaymentService {
  constructor(private readonly stripe: Stripe) {}

  // #===============================#
  // # ==> CREATE PAYMENT METHOD <== #
  // #===============================#
  async createPaymentMethod(payload: { user: UserEntity; paymentMethodId: string }) {
    const { user, paymentMethodId } = payload;
    let deleteCustomerFunc = () => Stripe.CustomersResource['del'];
    let detachPaymentMethodFunc = () => Stripe.PaymentMethodsResource['detach'];
    let paymentCustomerId = user.paymentCustomerId;

    // Create new paymentCustomer if user doesn't have one
    if (!paymentCustomerId) {
      const { id, email, firstName, lastName } = user;

      // Create the newPaymentCustomer
      const newPaymentCustomer = await this.stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        metadata: { userId: id },
      });
      paymentCustomerId = newPaymentCustomer.id;

      // Update deleteCustomerFunc for rollback
      deleteCustomerFunc = () => this.stripe.customers.del(paymentCustomerId);
    }

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

    // Update detachPaymentMethodFunc for rollback
    detachPaymentMethodFunc = () => this.stripe.paymentMethods.detach(paymentMethodId);

    return { paymentCustomerId, deleteCustomerFunc, detachPaymentMethodFunc };
  }

  // #===============================#
  // # ==> DETACH PAYMENT METHOD <== #
  // #===============================#
  async detachPaymentMethod(user: UserEntity, paymentMethodId: string) {
    const { paymentCustomerId } = user;

    // Case: Have no paymentCustomerId ==> Throw error
    if (!paymentCustomerId) throw new NotFoundException({ message: ERROR_MESSAGES.NOT_FOUND });

    // Get all paymentMethods belong to customer
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: paymentCustomerId,
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
    const { paymentCustomerId } = user;

    // Case: Have no paymentCustomerId ==> Throw error
    if (!paymentCustomerId) throw new NotFoundException({ message: ERROR_MESSAGES.NOT_FOUND });

    // List paymentMethods based on paymentCustomerId
    const stripePaymentMethods = await this.stripe.paymentMethods.list({
      customer: paymentCustomerId,
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

  // #===============================#
  // # ==> CREATE PAYMENT INTENT <== #
  // #===============================#
  async createPaymentIntent(payload: {
    user: UserEntity;
    cartItems: CartItemEntity[];
    paymentMethodId: string;
  }) {
    const { user, cartItems, paymentMethodId } = payload;
    const { paymentCustomerId, email } = user;

    // Case: Have no paymentCustomerId ==> Throw error
    if (!user.paymentCustomerId) throw new NotFoundException({ message: ERROR_MESSAGES.NOT_FOUND });

    // Calculate the total price
    const totalPrice = cartItems.reduce(
      (prev: number, { product, quantity }) => prev + product.unitPrice * 100 * quantity,
      0,
    );

    // Generate metadata
    const metadata = cartItems.reduce((prev: Stripe.MetadataParam, { product, quantity }) => {
      const { name, unitPrice } = product;
      prev[name] = `Quantity: ${quantity} - UnitPrice: ${unitPrice} }`;
      return prev;
    }, {});

    // Create new paymentIntent
    const newPaymentIntent = await this.stripe.paymentIntents.create({
      customer: paymentCustomerId,
      payment_method: paymentMethodId,
      amount: totalPrice,
      currency: 'usd',
      metadata,
      receipt_email: email,
      confirm: true,
    });
    const { id: paymentIntentId, status, client_secret } = newPaymentIntent;

    const cancelPaymentIntent = () => this.stripe.paymentIntents.cancel(paymentIntentId);

    // CASE: Status is invalid ==> Throw error
    if (['succeeded', 'requires_action'].includes(status))
      throw new BadRequestException({ message: `Status: ${status}` });

    return { cancelPaymentIntent, status, paymentIntentId, client_secret, totalPrice };
  }
}
