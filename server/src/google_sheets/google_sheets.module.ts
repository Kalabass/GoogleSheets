import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../../knexfile';
import { GoogleSheetsController } from './google_sheets.controller';
import { GoogleSheetsService } from './google_sheets.service';

@Module({
  imports: [KnexModule.forRoot({ config: knexConfig })],
  controllers: [GoogleSheetsController],
  providers: [GoogleSheetsService],
})
export class GoogleSheetsModule {}
