import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GoogleSheetsService } from './google_sheets.service';
import { GoogleSheetData } from './types/GoogleSheet.type';

class GoogleSheetDataDto implements GoogleSheetData {
  @ApiProperty({ description: 'Название Google Sheet' })
  sheet_id!: string;
}

@ApiTags('Google Sheets')
@Controller('google-sheets')
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  @Post()
  @ApiBody({ type: GoogleSheetDataDto })
  @ApiOperation({ summary: 'Создать запись в Google Sheets' })
  @ApiResponse({ status: 201, description: 'Успешное создание' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  create(@Body() createGoogleSheetDto: GoogleSheetData) {
    return this.googleSheetsService.create(createGoogleSheetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все записи Google Sheets' })
  @ApiResponse({ status: 200, description: 'Список всех записей' })
  findAll() {
    return this.googleSheetsService.findAll();
  }

  @Delete()
  @ApiBody({ type: GoogleSheetDataDto })
  @ApiOperation({ summary: 'Удалить запись по идентификатору' })
  @ApiResponse({ status: 200, description: 'Успешное удаление' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  remove(@Body() createGoogleSheetDto: GoogleSheetData) {
    return this.googleSheetsService.removeBySheetId(createGoogleSheetDto);
  }
}
