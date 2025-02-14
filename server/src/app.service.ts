import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { firstValueFrom } from 'rxjs';
import { GoogleSheetsService } from './google_sheets/google_sheets.service';
import { WarehousesService } from './warehouses/warehouses.service';

/**
 * Основной сервис приложения, отвечающий за обработку данных и интеграцию с Google Sheets.
 */
@Injectable()
export class AppService {
  private sheets: any;

  /**
   * Создает экземпляр `AppService`.
   * @param {GoogleSheetsService} googleSheetsService - Сервис для работы с таблицами Google Sheets.
   * @param {WarehousesService} wareHousesService - Сервис для работы со складами.
   * @param {ConfigService} configService - Сервис для управления конфигурацией.
   * @param {HttpService} httpService - HTTP-сервис для выполнения запросов.
   * @param {Knex} knex - Подключение к базе данных.
   */
  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly wareHousesService: WarehousesService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectConnection() private readonly knex: Knex
  ) {
    const auth = new JWT({
      email: configService.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      key: configService.get('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  /**
   * Запускается каждый час (CRON: `0 * * * *`).
   * Запрашивает данные с API Wildberries и обновляет записи складов в базе данных.
   * @throws {Error} В случае ошибки при запросе или обновлении базы.
   */
  @Cron('0 * * * *')
  async fetchData() {
    try {
      const date = new Date().toISOString().split('T')[0];
      const url = 'https://common-api.wildberries.ru/api/v1/tariffs/box';
      const apiKey = this.configService.get('WILDBERRIES_API_KEY');

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: apiKey },
          params: { date },
        })
      );

      if (!response.data) {
        console.error('API error');
        return;
      }

      const warehouseList = response.data.response.data.warehouseList;
      if (!warehouseList || warehouseList.length === 0) {
        console.error('No warehouses found');
        return;
      }

      const existingRecord = await this.knex('warehouses')
        .whereRaw('DATE(created_at) = ?', [date])
        .first();

      if (!existingRecord) {
        await this.wareHousesService.insertRecords(warehouseList);
      } else {
        await this.wareHousesService.updateRecords(warehouseList);
      }

      console.log('Warehouses updated');
    } catch (error) {
      console.error('Error while fetching data from API:', error);
    }
  }

  /**
   * Запускается каждый час (CRON: `0 * * * *`).
   * Экспортирует данные за текущий день в Google Sheets.
   * @throws {BadRequestException} Если нет данных для экспорта.
   * @throws {Error} В случае ошибки при обновлении таблицы.
   */
  @Cron('0 * * * *')
  async exportTodayData() {
    try {
      const date = new Date().toISOString().split('T')[0];

      const data = await this.knex('warehouses')
        .whereRaw('DATE(created_at) = ?', [date])
        .select(
          'created_at',
          'box_delivery_and_storage_expr',
          'box_delivery_base',
          'box_delivery_liter',
          'box_storage_base',
          'box_storage_liter',
          'warehouse_name'
        )
        .orderBy('box_delivery_and_storage_expr', 'asc');

      if (data.length === 0) {
        throw new BadRequestException('No data available for export.');
      }

      const tables = await this.googleSheetsService.findAll();
      if (!tables || tables.length === 0) {
        console.log('No sheets available for export.');
        return;
      }

      const headers = [
        [
          'Дата',
          'Коэффициент',
          'Доставка 1 литра',
          'Доставка каждого дополнительного литра',
          'Хранение 1 литра',
          'Хранение каждого дополнительного литра',
          'Название склада',
        ],
      ];

      const values = data.map((row) => [
        row.created_at,
        row.box_delivery_and_storage_expr,
        row.box_delivery_base,
        row.box_delivery_liter,
        row.box_storage_base,
        row.box_storage_liter,
        row.warehouse_name,
      ]);

      for (const table of tables) {
        const spreadsheetId = table.sheet_id;
        const sheetName = 'stock_coefs';

        const sheetsInfo = await this.sheets.spreadsheets.get({
          spreadsheetId,
        });
        const sheetsList = sheetsInfo.data.sheets.map(
          (s) => s.properties.title
        );

        if (!sheetsList.includes(sheetName)) {
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: { title: sheetName },
                  },
                },
              ],
            },
          });
        }

        await this.sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `${sheetName}`,
        });

        await this.sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: headers },
        });

        await this.sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A2`,
          valueInputOption: 'RAW',
          requestBody: { values },
        });
      }

      console.log('Data exported successfully');
    } catch (error) {
      console.error('Error while exporting data:', error);
    }
  }
}
