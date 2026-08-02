import { DataSourceOptions, DataSource } from 'typeorm';

// Single source of truth for TypeORM connection options.
// Consumed by BOTH the app (TypeOrmModule.forRoot in app.module.ts) and the
// typeorm CLI (pnpm migration:* scripts pass -d ./db/data-source.ts).
//
// NODE_ENV comes from the npm scripts (start:dev, test, test:e2e), NOT from
// any .env file. It picks the per-environment overrides below.
export const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: 'db.sqlite',
  entities: ['**/*.entity.ts'],
  synchronize: false,
  migrationsTableName: 'migrations',
};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dataSourceOptions, {
      type: 'sqlite',
      database: 'db.sqlite',
      // dev loads COMPILED entities (.js from dist) — run `pnpm build`
      // before start:prod or migration:run so the files exist.
      entities: ['*/**/*.entity.js'],
      // dev applies migrations MANUALLY via `pnpm migration:run`
      // (synchronize is false) — see README "Running it".
      migrations: ['migrations/*.js'],
    });
    break;
  case 'test':
    Object.assign(dataSourceOptions, {
      type: 'sqlite',
      database: 'test.sqlite',
      // tests run straight from TS (ts-jest), so use .ts entities.
      entities: ['*/**/*.entity.ts'],
      // throwaway DB: auto-sync schema so tests need no migrations.
      synchronize: true,
      migrationsRun: true,
    });
    break;
  case 'production':
    Object.assign(dataSourceOptions, {
      type: 'postgres',
      // set in .env (DATABASE_URL) — loaded by ConfigModule at boot.
      url: process.env.DATABASE_URL,
      // prod runs compiled .js (dist) like dev.
      entities: ['*/**/*.entity.js'],
      // no auto-sync in prod — schema must come from migrations only.
      synchronize: false,
      // apply pending migrations automatically on startup.
      migrationsRun: true,
    });
    break;
  default:
    throw new Error('Invalid NODE_ENV');
}

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
