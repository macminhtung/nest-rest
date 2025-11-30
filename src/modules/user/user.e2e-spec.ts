import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module';
import { UserEntity } from '@/modules/user/user.entity';
import { Repository } from 'typeorm';

describe('UserController (E2E)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const dataSource = moduleRef.get(DataSource);
    userRepository = dataSource.getRepository(UserEntity);

    // Clean DB before tests
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdUserId: string;

  it('POST /users → should create a user', async () => {
    const payload = { email: 'test@e2e.com', firstName: 'John', lastName: 'Doe' };

    const res = await request(app.getHttpServer()).post('/users').send(payload).expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(payload.email);

    createdUserId = res.body.id;
  });

  it('GET /users/:id → should get user by id', async () => {
    const res = await request(app.getHttpServer()).get(`/users/${createdUserId}`).expect(200);

    expect(res.body).toHaveProperty('id', createdUserId);
    expect(res.body).toHaveProperty('email', 'test@e2e.com');
  });

  it('PATCH /users/:id → should update user', async () => {
    const payload = { firstName: 'UpdatedJohn' };

    const res = await request(app.getHttpServer())
      .patch(`/users/${createdUserId}`)
      .send(payload)
      .expect(200);

    expect(res.body.firstName).toBe(payload.firstName);
  });

  it('GET /users → should get paginated users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .query({ page: 1, take: 10, keySearch: 'UpdatedJohn' })
      .expect(200);

    expect(res.body).toHaveProperty('records');
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records[0]).toHaveProperty('id', createdUserId);
  });

  it('DELETE /users/:id → should delete user', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .set('Authorization', 'Bearer fake-token') // nếu có guard JWT
      .expect(200);

    expect(res.body).toHaveProperty('deleted', true);
  });
});
