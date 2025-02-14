import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('warehouses', (warehouse) => {
    warehouse.increments('id').primary();
    warehouse.date('created_at').defaultTo(knex.fn.now()).index();
    warehouse.integer('box_delivery_and_storage_expr').notNullable();
    warehouse.decimal('box_delivery_base', 10, 2).notNullable();
    warehouse.decimal('box_delivery_liter', 10, 2).notNullable();
    warehouse.decimal('box_storage_base', 10, 2).nullable();
    warehouse.decimal('box_storage_liter', 10, 2).nullable();
    warehouse.string('warehouse_name').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('warehouses');
}
