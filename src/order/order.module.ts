import { Module } from '@nestjs/common';

import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { DbModule } from '@src/db/db.module';
import { OrdersRepository } from '@src/order/repository/order.repository';
@Module({
  imports: [DbModule], 
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService, OrdersRepository]
})
export class OrderModule {}
