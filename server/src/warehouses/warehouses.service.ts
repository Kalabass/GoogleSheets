import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { Warehouse } from './types/WareHouse.type';

/**
 * Сервис для управления записями складов в базе данных.
 */
@Injectable()
export class WarehousesService {
  /**
   * Создает экземпляр сервиса складов.
   * @param {Knex} knex - Подключение к базе данных Knex.
   */
  constructor(@InjectConnection() private readonly knex: Knex) {}

  /**
   * Конвертирует данные склада в формат, соответствующий базе данных.
   * @param {Warehouse[]} warehouseList - Список складов с данными в строковом формате.
   * @returns {Object[]} - Список объектов с числовыми значениями для вставки в базу данных.
   * @private
   */
  private convertWarehouseData(warehouseList: Warehouse[]) {
    return warehouseList.map((warehouse) => ({
      box_delivery_and_storage_expr: Number(
        warehouse.boxDeliveryAndStorageExpr
      ),
      box_delivery_base: parseFloat(
        warehouse.boxDeliveryBase.replace(',', '.')
      ),
      box_delivery_liter: parseFloat(
        warehouse.boxDeliveryLiter.replace(',', '.')
      ),
      box_storage_base: parseFloat(warehouse.boxStorageBase.replace(',', '.')),
      box_storage_liter: parseFloat(
        warehouse.boxStorageLiter.replace(',', '.')
      ),
      warehouse_name: warehouse.warehouseName,
    }));
  }

  /**
   * Вставляет новые записи складов в базу данных.
   * @param {Warehouse[]} warehouseList - Список складов для вставки.
   * @throws {Error} - В случае ошибки при вставке данных.
   */
  async insertRecords(warehouseList: Warehouse[]) {
    try {
      const records = this.convertWarehouseData(warehouseList);
      await this.knex('warehouses').insert(records);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Обновляет существующие записи складов в базе данных.
   * @param {Warehouse[]} warehouseList - Список складов с обновленными данными.
   * @throws {Error} - В случае ошибки при обновлении данных.
   */
  async updateRecords(warehouseList: Warehouse[]) {
    try {
      const records = this.convertWarehouseData(warehouseList);
      for (const warehouse of records) {
        await this.knex('warehouses')
          .where({ warehouse_name: warehouse.warehouse_name }) // приведение к snake_case
          .update({
            box_delivery_and_storage_expr:
              warehouse.box_delivery_and_storage_expr,
            box_delivery_base: warehouse.box_delivery_base,
            box_delivery_liter: warehouse.box_delivery_liter,
            box_storage_base: warehouse.box_storage_base,
            box_storage_liter: warehouse.box_storage_liter,
          });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
