import { BadRequestException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { hash, compare } from 'bcrypt';
import Stripe from 'stripe';
import { DEFAULT_ROLES } from '@/common/constants';
import { BaseService } from '@/common/base.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { UserEntity } from '@/modules/user/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersPaginatedDto,
  AddCardDto,
} from '@/modules/user/dtos';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public readonly repository: Repository<UserEntity>,

    private readonly paymentService: PaymentService,
  ) {
    super(repository);
  }

  // #=========================#
  // # ==> RANDOM PASSWORD <== #
  // #=========================#
  randomPassword(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * 62))).join('');
  }

  // #================================#
  // # ==> GENERATE HASH PASSWORD <== #
  // #================================#
  async generateHashPassword(password: string) {
    const hashPassword = await hash(password, 10);
    return hashPassword;
  }

  // #===============================#
  // # ==> COMPARE HASH PASSWORD <== #
  // #===============================#
  async compareHashPassword(payload: { password: string; hashPassword: string }) {
    const { password, hashPassword } = payload;
    return await compare(password, hashPassword);
  }

  // #=====================#
  // # ==> CREATE USER <== #
  // #=====================#
  async createUser(payload: CreateUserDto) {
    const { email } = payload;
    // Prevent creating if email has conflict
    await this.checkConflict({ where: { email } });

    // Hash the password
    const temporaryPassword = this.randomPassword(); // TODO: ==> Send the temporaryPassword via email
    const hashPassword = await this.generateHashPassword(temporaryPassword);

    // Create newUser
    const newUser = await this.repository.save({
      id: uuidv7(),
      ...payload,
      password: hashPassword,
      roleId: DEFAULT_ROLES.USER.id,
    });

    return newUser;
  }

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  async updateUser(id: string, payload: UpdateUserDto) {
    // Check the user already exists
    const existedUser = await this.checkExist({ where: { id } });

    // Update the user
    await this.repository.update(id, payload);

    return { ...existedUser, ...payload };
  }

  // #==================#
  // # ==> GET USER <== #
  // #==================#
  async getUser(id: string) {
    const existedUser = await this.checkExist({ where: { id }, relations: { role: true } });
    return existedUser;
  }

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  async getPaginatedUsers(queryParams: GetUsersPaginatedDto) {
    const paginationData = await this.getPaginatedRecords(queryParams, (qb) => {
      const { keySearch, roleIds, email } = queryParams;
      const alias = this.entityName;

      qb.leftJoinAndSelect(`${alias}.role`, 'role');

      // Filter based on roleIds
      if (roleIds?.length) qb.andWhere(`${alias}.roleId IN (:...roleIds)`, { roleIds });

      // Filter based on email
      if (email) qb.andWhere(`${alias}.email = :email`, { email });

      // Query based on keySearch
      if (keySearch)
        qb.andWhere(`(${alias}.firstName ILIKE :keySearch OR ${alias}.lastName ILIKE :keySearch)`, {
          keySearch: `%${keySearch}`,
        });
    });

    return paginationData;
  }

  // #=====================#
  // # ==> DELETE USER <== #
  // #=====================#
  async deleteUser(authUser: UserEntity, id: string) {
    // Prevent delete yourself
    if (authUser.id === id) throw new BadRequestException({ message: 'Can not delete yourself' });

    // Check the user already exists
    await this.checkExist({ where: { id } });

    // Delete the user
    await this.repository.delete(id);

    return id;
  }

  // #==================#
  // # ==> ADD CARD <== #
  // #==================#
  async addCard(user: UserEntity, payload: AddCardDto) {
    const { paymentMethodId } = payload;
    let deleteCustomerFunc = () => Stripe.CustomersResource['del'];
    let detachPaymentMethodFunc = () => Stripe.PaymentMethodsResource['detach'];

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await this.handleTransactionAndRelease({
      queryRunner,
      processFunc: async () => {
        // Create a new paymentMethod
        const { paymentCustomerId, deleteCustomer, detachPaymentMethod } =
          await this.paymentService.createPaymentMethod({ user, paymentMethodId });

        // Update deleteCustomerFunc & detachPaymentMethodFunc for callback
        deleteCustomerFunc = deleteCustomer;
        detachPaymentMethodFunc = detachPaymentMethod;

        // Update the paymentCustomerId
        if (!user.paymentCustomerId) {
          queryRunner.manager.update(UserEntity, user.id, { paymentCustomerId });
        }
      },
      rollbackFunc: async () => {
        await deleteCustomerFunc();
        await detachPaymentMethodFunc();
      },
    });

    return HttpStatus.OK;
  }

  // #=====================#
  // # ==> REMOVE CARD <== #
  // #=====================#
  async removeCard(user: UserEntity, payload: AddCardDto) {
    const { paymentMethodId } = payload;
    await this.paymentService.detachPaymentMethod(user, paymentMethodId);
    return HttpStatus.OK;
  }

  // #===================#
  // # ==> GET CARDS <== #
  // #===================#
  async getCards(user: UserEntity) {
    const paymentMethods = await this.paymentService.listPaymentMethods(user);
    return paymentMethods;
  }
}
