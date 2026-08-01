import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const email = 'd.xyz1@test.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: '1qaz!QAZ',
      })
      .expect(201)
      .then((res) => {
        expect(res.body.email).toEqual(email);
        expect(res.body.id).toBeDefined();
      });
  });

  it('signup as a new user then get current logged in user', async () => {
    const email = 'user@example.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123' });
    expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(email);
  });
});
