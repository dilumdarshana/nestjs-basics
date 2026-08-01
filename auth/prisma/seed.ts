import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = '1qaz!QAZ';

async function seedRoles() {
  for (const name of ['admin', 'user']) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seeded roles: admin, user');
}

async function seedAdmin() {
  const { id: roleId } = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const password = await hash(ADMIN_PASSWORD);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role_id: roleId, password },
    create: {
      name: 'Admin',
      email: ADMIN_EMAIL,
      password,
      role_id: roleId,
    },
  });
  console.log(`Seeded admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

async function main() {
  if (process.argv.includes('--admin')) {
    await seedAdmin();
  } else {
    await seedRoles();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
