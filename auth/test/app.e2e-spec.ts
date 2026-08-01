import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  it('signup, then signin, then access a protected route', async () => {
    const email = `user-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ name: 'Test User', email, password: 'test123' })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toEqual('User created successfully');
      });

    const signin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username: email, password: 'test123' })
      .expect(201);

    const { accessToken } = signin.body;

    const whoami = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(whoami.body.email).toEqual(email);
  });

  afterAll(async () => {
    await app.close();
  });
});
