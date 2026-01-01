import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { DbModule } from '@src/db/db.module';
import { CartRepository } from '@src/cart/repository/cart.repository';

@Module({
  imports: [DbModule], 
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
