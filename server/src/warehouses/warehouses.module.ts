import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../../knexfile';

import { WarehousesService } from './warehouses.service';

@Module({
  imports: [KnexModule.forRoot({ config: knexConfig })],
  providers: [WarehousesService],
})
export class WarehousesModule {}
