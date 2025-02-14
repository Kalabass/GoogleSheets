import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../knexfile';

import { AppService } from './app.service';
import { GoogleSheetsModule } from './google_sheets/google_sheets.module';
import { GoogleSheetsService } from './google_sheets/google_sheets.service';
import { WarehousesModule } from './warehouses/warehouses.module';
import { WarehousesService } from './warehouses/warehouses.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule.forRoot({ config: knexConfig }),
    ScheduleModule.forRoot(),
    GoogleSheetsModule,
    WarehousesModule,
  ],
  providers: [AppService, GoogleSheetsService, WarehousesService],
})
export class AppModule {}
