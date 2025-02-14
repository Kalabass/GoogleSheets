import type { Knex } from 'knex';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: 'postgres',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/db/migrations',
  },
  seeds: {
    directory: './src/db/seeds',
  },
};

export default config;
