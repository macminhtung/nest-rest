import { TestApp } from '../utils/test-app';

describe('AppController (e2e)', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await TestApp.create();
  });

  afterEach(async () => {
    await testApp.close();
  });

  it('/ -> GET', () => {
    return testApp.getRequest().get('/').expect(200).expect('Hello World!');
  });
});
