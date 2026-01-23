import { TestApp } from '@test/utils/test-app';
import { HttpStatus } from '@nestjs/common';
import { DEFAULT_ROLES } from '@/common/constants';
import { ETableName } from '@/common/enums';
import { UserEntity } from '@/modules/user/user.entity';
import { PaginatedResponseDto } from '@/common/dtos';
import { CreateUserDto, UpdateUserDto, GetUsersPaginatedDto } from '@/modules/user/dtos';

describe('User endpoint', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await TestApp.create();
  });

  afterEach(async () => {
    await testApp.close();
  });

  // #=====================#
  // # ==> CREATE USER <== #
  // #=====================#

  it(`/${ETableName.USER} -> POST`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    return await testApp
      .getRequest()
      .post(`/${ETableName.USER}`)
      .send(createPayload)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        const user: UserEntity = res.body;
        const { id, email, firstName, lastName } = user;
        expect(id).toBeDefined();
        expect(email).toBe(createPayload.email);
        expect(firstName).toBe(createPayload.firstName);
        expect(lastName).toBe(createPayload.lastName);
      });
  });

  it(`/${ETableName.USER} -> POST (Invalid email)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test',
      roleId: DEFAULT_ROLES.USER.id,
    };
    return await testApp
      .getRequest()
      .post(`/${ETableName.USER}`)
      .send(createPayload)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`/${ETableName.USER} -> POST (Email already taken)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp
      .getRequest()
      .post(`/${ETableName.USER}`)
      .send(createPayload)
      .expect(HttpStatus.CREATED);

    const payloadEmailTaken: CreateUserDto = {
      firstName: 'test2',
      lastName: 'test2',
      email: createPayload.email,
      roleId: DEFAULT_ROLES.USER.id,
    };

    return await testApp
      .getRequest()
      .post(`/${ETableName.USER}`)
      .send(payloadEmailTaken)
      .expect(HttpStatus.CONFLICT);
  });

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  it(`/${ETableName.USER}/:userId -> PUT (Update user)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    const res = await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);
    const user: UserEntity = res.body;

    const updatePayload: UpdateUserDto = {
      firstName: 'test 1',
      lastName: 'test 2',
      roleId: DEFAULT_ROLES.USER.id,
    };

    return await testApp
      .getRequest()
      .put(`/${ETableName.USER}/${user.id}`)
      .send(updatePayload)
      .expect(HttpStatus.OK)
      .then((res) => {
        const user: UserEntity = res.body;
        const { id, email, firstName, lastName } = user;
        expect(id).toBeDefined();
        expect(email).toBe(user.email);
        expect(firstName).toBe(updatePayload.firstName);
        expect(lastName).toBe(updatePayload.lastName);
      });
  });

  it(`/${ETableName.USER}/:userId -> PUT (Invalid UUID)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);

    const updatePayload: UpdateUserDto = {
      firstName: 'test',
      lastName: 'test',
      roleId: DEFAULT_ROLES.USER.id,
    };

    return await testApp
      .getRequest()
      .put(`/${ETableName.USER}/1`)
      .send(updatePayload)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`/${ETableName.USER}/:userId -> PUT (User Not Found)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);

    const updatePayload: UpdateUserDto = {
      firstName: 'test',
      lastName: 'test',
      roleId: DEFAULT_ROLES.USER.id,
    };

    return await testApp
      .getRequest()
      .put(`/${ETableName.USER}/${testApp.testUUID}`)
      .send(updatePayload)
      .expect(HttpStatus.NOT_FOUND);
  });

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  it(`/${ETableName.USER}/:userId -> GET (Valid user)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    const res = await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);
    const createdUser: UserEntity = res.body;

    return await testApp
      .getRequest()
      .get(`/${ETableName.USER}/${createdUser.id}`)
      .expect(200)
      .then((res) => {
        const user: UserEntity = res.body;
        const { id, email, firstName, lastName } = user;
        expect(id).toBeDefined();
        expect(email).toBe(createPayload.email);
        expect(firstName).toBe(createPayload.firstName);
        expect(lastName).toBe(createPayload.lastName);
      });
  });

  it(`/${ETableName.USER}/:userId -> GET (Invalid UUID)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);

    return await testApp.getRequest().get(`/${ETableName.USER}/1`).expect(HttpStatus.BAD_REQUEST);
  });

  it(`/${ETableName.USER}/:userId -> GET (User not Found)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);

    await testApp
      .getRequest()
      .get(`/${ETableName.USER}/${testApp.testUUID}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  it(`/${ETableName.USER}/paginated -> GET (Get users - pagination)`, async () => {
    const createPayload1: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test1@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    const createPayload2: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test2@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp
      .getRequest()
      .post(`/${ETableName.USER}`)
      .send(createPayload1)
      .expect(HttpStatus.CREATED);
    await testApp
      .getRequest()
      .post(`/${ETableName.USER}`)
      .send(createPayload2)
      .expect(HttpStatus.CREATED);

    const queryParams: GetUsersPaginatedDto = {
      page: 1,
      take: 2,
      excludeIds: [testApp.authId],
      roleIds: [],
    };

    return await testApp
      .getRequest()
      .get(`/${ETableName.USER}/paginated`)
      .query({ ...queryParams })
      .expect(HttpStatus.OK)
      .then((res) => {
        const paginatedRes: PaginatedResponseDto<UserEntity> = res.body;
        const { page, take, total, records } = paginatedRes;
        expect(page).toBe(queryParams.page);
        expect(take).toBe(queryParams.take);
        expect(total).toBe(2);
        expect(records.length).toBe(2);
        expect(records[0].email).toBe(createPayload2.email);
        expect(records[1].email).toBe(createPayload1.email);
      });
  });

  it(`/${ETableName.USER} -> GET (Get users - pagination - Get by email)`, async () => {
    const createPayload1: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test1@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    const createPayload2: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test2@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp
      .getRequest()
      .post(`/${ETableName.USER}`)
      .send(createPayload1)
      .expect(HttpStatus.CREATED);
    await testApp
      .getRequest()
      .post(`/${ETableName.USER}`)
      .send(createPayload2)
      .expect(HttpStatus.CREATED);

    const queryParams: GetUsersPaginatedDto = {
      roleIds: [DEFAULT_ROLES.USER.id],
    };

    return await testApp
      .getRequest()
      .get(`/${ETableName.USER}/paginated`)
      .query({ ...queryParams })
      .expect(HttpStatus.OK)
      .then((res) => {
        const paginatedResponse: PaginatedResponseDto<UserEntity> = res.body;
        const { total, records } = paginatedResponse;
        expect(total).toBe(1);
        expect(records.length).toBe(1);
        expect(records[0].email).toBe(createPayload1.email);
      });
  });

  it(`/${ETableName.USER} -> GET (Get users - pagination - Get by invalid email)`, async () => {
    const queryParams: GetUsersPaginatedDto = {
      roleIds: [DEFAULT_ROLES.USER.id],
    };

    return await testApp
      .getRequest()
      .get(`/${ETableName.USER}/paginated`)
      .query({ ...queryParams })
      .expect(HttpStatus.BAD_REQUEST);
  });

  // #===========================#
  // # ==> DELETE USER BY ID <== #
  // #===========================#
  it(`/${ETableName.USER}/:userId -> DELETE`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    const res = await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);
    const user: UserEntity = res.body;

    await testApp.getRequest().delete(`/${ETableName.USER}/${user.id}`).expect(HttpStatus.OK);
    await testApp.getRequest().get(`/${ETableName.USER}/${user.id}`).expect(HttpStatus.NOT_FOUND);
  });

  it(`/${ETableName.USER}/:userId -> DELETE (Invalid UUID)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);
    await testApp
      .getRequest()
      .delete(`/${ETableName.USER}/invalid-uuid`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`/${ETableName.USER}/:userId -> DELETE (User not Found)`, async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      roleId: DEFAULT_ROLES.USER.id,
    };
    await testApp.getRequest().post(`/${ETableName.USER}`).send(createPayload);
    await testApp
      .getRequest()
      .delete(`/${ETableName.USER}/${testApp.testUUID}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
