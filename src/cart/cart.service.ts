import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartRepository } from '@src/cart/repository/cart.repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}
  create(data: CreateCartDto, patientId: string) {
    return this.cartRepository.create(data, patientId);
  }

  findAll(patientId: string) {
    return this.cartRepository.findAll(patientId);
  }

  findOne(patientId: string) {
    return this.cartRepository.findOne(patientId);
  }

  async update(data: CreateCartDto, patientId: string) {
    const isExistingCartRecord = await this.findOne(patientId);
    if (!isExistingCartRecord) {
      return this.create(data, patientId);
    }

    return this.cartRepository.update(data, patientId);
  }
}
