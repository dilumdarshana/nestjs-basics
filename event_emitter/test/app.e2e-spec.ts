import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Event emitter (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('creates an account and generates a snapshot via the event emitter', async () => {
    await request(app.getHttpServer())
      .post('/accounts')
      .send({ name: 'John', amount: 100 })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/snapshots')
      .expect(200);

    expect(res.body).toEqual([
      expect.objectContaining({ account: { name: 'John', amount: 100 } }),
    ]);
  });
});
