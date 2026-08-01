import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { hash } from 'argon2';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  async function signupAndSignin(prefix: string) {
    const email = `${prefix}-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ name: 'Test User', email, password: 'test123' })
      .expect(201);

    const signin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username: email, password: 'test123' })
      .expect(201);

    return signin.body;
  }

  it('signup, then signin, then access a protected route', async () => {
    const { email, accessToken } = await signupAndSignin('user');

    const whoami = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(whoami.body.email).toEqual(email);
  });

  it('denies non-admin users on admin routes (RBAC)', async () => {
    const { accessToken } = await signupAndSignin('rls-user');

    await request(app.getHttpServer())
      .get('/admin/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .post('/admin/role')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'moderator' })
      .expect(403);
  });

  it('lets an admin list and create roles', async () => {
    const { id: roleId } = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin' },
    });

    const email = `admin-${Date.now()}@example.com`;
    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password: await hash('test123'),
        role_id: roleId,
      },
    });

    const signin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username: email, password: 'test123' })
      .expect(201);

    const { accessToken } = signin.body;

    const list = await request(app.getHttpServer())
      .get('/admin/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);

    const created = await request(app.getHttpServer())
      .post('/admin/role')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `role-${Date.now()}` })
      .expect(201);

    expect(created.body).toHaveProperty('id');
  });
});
