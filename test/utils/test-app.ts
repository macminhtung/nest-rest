import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { ACCESS_TOKEN_HEADER_KEY } from '@/guards';
import { AuthService } from '@/modules/auth/auth.service';
import { AppModule } from '@/app.module';
import { DEFAULT_ROLES } from '@/common/constants';

export class TestApp {
  app: INestApplication;
  authId: string;
  accessToken: string;
  testUUID = '2ba986fa-28a3-4b20-ac4a-5b2b09238154';

  static async create(): Promise<TestApp> {
    const testApp = new TestApp();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    testApp.app = moduleFixture.createNestApplication();
    await testApp.app.init();

    const dataSource = testApp.app.get(DataSource);
    await dataSource.synchronize(true);

    // Insert roles
    await dataSource.manager.insert('role', [
      { id: DEFAULT_ROLES.ADMIN.id, name: DEFAULT_ROLES.ADMIN.name },
      { id: DEFAULT_ROLES.USER.id, name: DEFAULT_ROLES.USER.name },
    ]);

    // Signup
    const authService = moduleFixture.get<AuthService>(AuthService);
    const { id } = await authService.signUp({ email: 'whxoans@gmail.com', password: '123456' });

    // Signin to get the accessToken
    const fakeRes = { cookie: jest.fn() } as unknown as Response;
    const { accessToken } = await authService.signIn(fakeRes, {
      email: 'whxoans@gmail.com',
      password: '123456',
    });
    testApp.accessToken = accessToken;
    testApp.authId = id;

    return testApp;
  }

  private getHttpServer() {
    return this.app.getHttpServer();
  }

  getRequest() {
    return this.authRequest(this.getHttpServer(), this.accessToken);
  }

  public async close() {
    return await this.app.close();
  }

  private authRequest(server: any, accessToken: string) {
    return {
      get: (url) => request(server).get(url).set(ACCESS_TOKEN_HEADER_KEY, accessToken),
      post: (url) => request(server).post(url).set(ACCESS_TOKEN_HEADER_KEY, accessToken),
      patch: (url) => request(server).patch(url).set(ACCESS_TOKEN_HEADER_KEY, accessToken),
      delete: (url) => request(server).delete(url).set(ACCESS_TOKEN_HEADER_KEY, accessToken),
    };
  }
}
