import { DataSourceOptions, DataSource } from 'typeorm';

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
      entities: ['*/**/*.entity.js'],
      migrations: ['migrations/*.js'],
    });
    break;
  case 'test':
    Object.assign(dataSourceOptions, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['*/**/*.entity.ts'],
      synchronize: true,
      migrationsRun: true,
    });
    break;
  case 'production':
    Object.assign(dataSourceOptions, {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['*/**/*.entity.js'],
      synchronize: false,
      migrationsRun: true,
    });
    break;
  default:
    throw new Error('Invalid NODE_ENV');
}

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
