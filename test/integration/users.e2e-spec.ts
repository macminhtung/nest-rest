import { TestApp } from '@test/utils/test-app';
import { HttpStatus } from '@nestjs/common';
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

  it('/users -> POST', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    return await testApp
      .getRequest()
      .post('/users')
      .send(createPayload)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        const user: UserEntity = res.body;
        const { id, email, firstName, lastName, location } = user;
        expect(id).toBeDefined();
        expect(email).toEqual(createPayload.email);
        expect(firstName).toEqual(createPayload.firstName);
        expect(lastName).toEqual(createPayload.lastName);
        expect(location).toEqual(createPayload.location);
      });
  });

  it('/users -> POST (Invalid email)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test',
      location: 'test',
    };
    return await testApp
      .getRequest()
      .post('/users')
      .send(createPayload)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/users -> POST (Email already taken)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload).expect(HttpStatus.CREATED);

    const payloadEmailTaken: CreateUserDto = {
      firstName: 'test2',
      lastName: 'test2',
      email: createPayload.email,
      location: 'test2',
    };

    return await testApp
      .getRequest()
      .post('/users')
      .send(payloadEmailTaken)
      .expect(HttpStatus.CONFLICT);
  });

  // #=====================#
  // # ==> UPDATE USER <== #
  // #=====================#
  it('/users/:userId -> PATCH (Update user)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    const res = await testApp.getRequest().post('/users').send(createPayload);
    const user: UserEntity = res.body;

    const updatePayload: UpdateUserDto = {
      firstName: 'test 1',
      lastName: 'test 2',
    };

    return await testApp
      .getRequest()
      .patch(`/users/${user.id}`)
      .send(updatePayload)
      .expect(HttpStatus.OK)
      .then((res) => {
        const user: UserEntity = res.body;
        const { id, email, firstName, lastName, location } = user;
        expect(id).toBeDefined();
        expect(email).toEqual(user.email);
        expect(firstName).toEqual(updatePayload.firstName);
        expect(lastName).toEqual(updatePayload.lastName);
        expect(location).toEqual(user.location);
      });
  });

  it('/users/:userId -> PATCH (Invalid UUID)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload);
    const updatePayload: UpdateUserDto = { firstName: 'test' };
    return await testApp
      .getRequest()
      .patch('/users/1')
      .send(updatePayload)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/:userId -> PATCH (User Not Found)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload);

    const updatePayload: UpdateUserDto = { firstName: 'test' };
    return await testApp
      .getRequest()
      .patch(`/users/${testApp.testUUID}`)
      .send(updatePayload)
      .expect(HttpStatus.NOT_FOUND);
  });

  // #========================#
  // # ==> GET USER BY ID <== #
  // #========================#
  it('users/:userId -> GET (Valid user)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    const res = await testApp.getRequest().post('/users').send(createPayload);
    const createdUser: UserEntity = res.body;

    return await testApp
      .getRequest()
      .get(`/users/${createdUser.id}`)
      .expect(200)
      .then((res) => {
        const user: UserEntity = res.body;
        const { id, email, firstName, lastName, location } = user;
        expect(id).toBeDefined();
        expect(email).toEqual(createPayload.email);
        expect(firstName).toEqual(createPayload.firstName);
        expect(lastName).toEqual(createPayload.lastName);
        expect(location).toEqual(createPayload.location);
      });
  });

  it('/users/:userId -> GET (Invalid UUID)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload);

    return await testApp.getRequest().get('/users/1').expect(HttpStatus.BAD_REQUEST);
  });

  it('/users/:userId -> GET (User not Found)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload);

    await testApp.getRequest().get(`/users/${testApp.testUUID}`).expect(HttpStatus.NOT_FOUND);
  });

  // #=============================#
  // # ==> GET PAGINATED USERS <== #
  // #=============================#
  it('/users -> GET (Get users - pagination)', async () => {
    const createPayload1: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test1@test.com',
      location: 'test',
    };
    const createPayload2: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test2@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload1).expect(HttpStatus.CREATED);
    await testApp.getRequest().post('/users').send(createPayload2).expect(HttpStatus.CREATED);

    const queryParams: GetUsersPaginatedDto = {
      page: 1,
      take: 2,
      excludeIds: [testApp.authId],
    };

    return await testApp
      .getRequest()
      .get('/users')
      .query({ ...queryParams })
      .expect(HttpStatus.OK)
      .then((res) => {
        const paginatedRes: PaginatedResponseDto<UserEntity> = res.body;
        const { page, take, total, records } = paginatedRes;
        expect(page).toEqual(queryParams.page);
        expect(take).toEqual(queryParams.take);
        expect(total).toEqual(2);
        expect(records.length).toEqual(2);
        expect(records[0].email).toEqual(createPayload2.email);
        expect(records[1].email).toEqual(createPayload1.email);
      });
  });

  it('/users -> GET (Get users - pagination - Get by email)', async () => {
    const createPayload1: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test1@test.com',
      location: 'test',
    };
    const createPayload2: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test2@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload1).expect(HttpStatus.CREATED);
    await testApp.getRequest().post('/users').send(createPayload2).expect(HttpStatus.CREATED);

    const queryParams: GetUsersPaginatedDto = {
      email: createPayload1.email,
    };

    return await testApp
      .getRequest()
      .get('/users')
      .query({ ...queryParams })
      .expect(HttpStatus.OK)
      .then((res) => {
        const paginatedRes: PaginatedResponseDto<UserEntity> = res.body;
        const { total, records } = paginatedRes;
        expect(total).toEqual(1);
        expect(records.length).toEqual(1);
        expect(records[0].email).toEqual(createPayload1.email);
      });
  });

  it('/users -> GET (Get users - pagination - Get by invalid email)', async () => {
    const queryParams: GetUsersPaginatedDto = {
      email: 'email',
    };

    return await testApp
      .getRequest()
      .get('/users')
      .query({ ...queryParams })
      .expect(HttpStatus.BAD_REQUEST);
  });

  // #===========================#
  // # ==> DELETE USER BY ID <== #
  // #===========================#
  it('/:userId -> DELETE', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    const res = await testApp.getRequest().post('/users').send(createPayload);
    const user: UserEntity = res.body;

    await testApp.getRequest().delete(`/users/${user.id}`).expect(HttpStatus.OK);
    await testApp.getRequest().get(`/users/${user.id}`).expect(HttpStatus.NOT_FOUND);
  });

  it('/:userId -> DELETE (Invalid UUID)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload);

    await testApp.getRequest().delete('/users/1').expect(HttpStatus.BAD_REQUEST);
  });

  it('/:userId -> DELETE (User not Found)', async () => {
    const createPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };
    await testApp.getRequest().post('/users').send(createPayload);

    await testApp.getRequest().delete(`/users/${testApp.testUUID}`).expect(HttpStatus.NOT_FOUND);
  });
});
