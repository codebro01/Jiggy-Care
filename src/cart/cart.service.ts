import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartRepository } from '@src/cart/repository/cart.repository';
import { CartItemDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}
  create(data: CreateCartDto, patientId: string) {
    return this.cartRepository.create(data, patientId);
  }

  findAll() {
    return this.cartRepository.findAll();
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

  clearCart(patientId: string) {
    return this.cartRepository.clearCartItems(patientId);
  }

  async addItem(patientId: string, item: CartItemDto) {
    const cart = await this.findOne(patientId);

    if (!cart) {
      return this.create({ items: [item] }, patientId);
    }

    const existingItems = cart.items || [];
    const existingItemIndex = existingItems.findIndex(
      (i) => i.medicationId === item.medicationId,
    );

    let updatedItems: CartItemDto[];
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      updatedItems = [...existingItems];
      updatedItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      updatedItems = [...existingItems, item];
    }

    return this.cartRepository.update({ items: updatedItems }, patientId);
  }

  // Remove specific item
  async removeItem(patientId: string, medicationId: string) {
    const cart = await this.findOne(patientId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const updatedItems = (cart.items || []).filter(
      (item) => item.medicationId !== medicationId,
    );

    return this.cartRepository.update({ items: updatedItems }, patientId);
  }

  // Update item quantity
  async updateItemQuantity(
    patientId: string,
    medicationId: string,
    quantity: number,
  ) {
    const cart = await this.findOne(patientId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const updatedItems = (cart.items || []).map((item) =>
      item.medicationId === medicationId ? { ...item, quantity } : item,
    );

    return this.cartRepository.update({ items: updatedItems }, patientId);
  }
}
