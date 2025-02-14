import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('google_sheets').del();

  await knex('google_sheets').insert([
    { sheet_id: '1RjEGYExUtEFh55pOUzZ8AB_W6oOT_Nr79g-bimd-pac' },
    { sheet_id: '1JBKNpadGMQPsIPgHnuqnBYCZtupy0-bQIg42QOcUon8' },
    { sheet_id: '1ht3aaTljsffCJrEyzJTrwn5yNYXB26xmuE-gFVkUSH4' },
  ]);
}
