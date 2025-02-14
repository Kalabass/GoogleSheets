import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('google_sheets', (google_sheet) => {
    google_sheet.increments('id').primary();
    google_sheet.string('sheet_id').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('google_sheets');
}
