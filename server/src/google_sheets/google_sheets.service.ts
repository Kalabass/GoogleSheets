import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { GoogleSheet, GoogleSheetData } from './types/GoogleSheet.type';

/**
 * Сервис для управления записями таблиц Google Sheets в базе данных.
 */
@Injectable()
export class GoogleSheetsService {
  /**
   * Создает экземпляр сервиса Google Sheets.
   * @param {Knex} knex - Подключение к базе данных Knex.
   */
  constructor(@InjectConnection() private readonly knex: Knex) {}

  /**
   * Создает новую запись о Google Sheet в базе данных.
   * @param {GoogleSheetData} createGoogleSheetDto - Данные для создания записи.
   * @returns {Promise<number[]>} - Возвращает массив с ID вставленной записи.
   * @throws {Error} - В случае ошибки при вставке данных.
   */
  async create(createGoogleSheetDto: GoogleSheetData): Promise<number[]> {
    try {
      return await this.knex('google_sheets').insert(createGoogleSheetDto);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Получает все записи Google Sheets из базы данных.
   * @returns {Promise<GoogleSheet[]>} - Возвращает массив записей.
   * @throws {Error} - В случае ошибки при выполнении запроса.
   */
  async findAll(): Promise<GoogleSheet[]> {
    try {
      return await this.knex('google_sheets').select('*');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Удаляет запись Google Sheet по идентификатору.
   * @param {GoogleSheetData} sheet_id - Объект, содержащий `sheet_id` таблицы, которую нужно удалить.
   * @returns {Promise<number>} - Количество удаленных строк.
   * @throws {Error} - В случае ошибки при удалении.
   */
  async removeBySheetId(sheet_id: GoogleSheetData): Promise<number> {
    try {
      return await this.knex('google_sheets').where(sheet_id).del();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
