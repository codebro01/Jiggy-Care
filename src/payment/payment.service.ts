import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  HttpStatus,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  generateSecureInvoiceId,
  generateSecureOrderId,
  generateSecureRef,
  PaymentRepository,
} from '@src/payment/repository/payment.repository';
import { UserRepository } from '@src/users/repository/user.repository';
import crypto from 'crypto';
import { initializeBookingPaymentDto } from '@src/payment/dto/initializePaymentDto';
import { NotificationService } from '@src/notification/notification.service';
import { BookingRepository } from '@src/booking/repository/booking.repository';
import {
  VariantType,
  CategoryType,
  StatusType,
} from '@src/notification/dto/createNotificationDto';
import { CreateOrderDto } from '@src/order/dto/create-order.dto';
import { PaymentForType } from './dto/paystackMetadataDto';
import { OrdersRepository } from '@src/order/repository/order.repository';
import { MedicationRepository } from '@src/medication/medication.repository';

interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    customer: {
      email: string;
    };
  };
}

@Injectable()
export class PaymentService {
  private readonly baseUrl: string = 'https://api.paystack.co';
  private readonly secretKey: string;
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private userRepository: UserRepository,
    private paymentRepository: PaymentRepository,
    private readonly notificationService: NotificationService,
    private readonly bookingRepository: BookingRepository,
    private readonly orderRepository: OrdersRepository,
    private readonly medicationRepository: MedicationRepository,
  ) {
    const key = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!key) {
      throw new BadRequestException('Please provide paystack secretKey');
    }
    this.secretKey = key;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeBookingPayment(data: initializeBookingPaymentDto) {
    if (!data.metadata)
      throw new BadRequestException(
        'Required payload for payment not provided',
      );
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            email: data.email,
            amount: data.amount,
            reference: generateSecureRef(),
            callback_url: data.callback_url,
            metadata: {
              ...data.metadata,
              invoiceId: generateSecureInvoiceId(),
              dateInitiated: new Date().toISOString(),
              paymentFor: PaymentForType.BOOKINGS,
            },
          },
          { headers: this.getHeaders() },
        ),
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.response?.data?.message || 'Failed to initialize payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async initializeMedicationOrder(data: {
    email: string;
    metadata: CreateOrderDto & { patientId: string };
  }) {
    if (!data)
      throw new BadRequestException(
        'Required payload for payment not provided',
      );

    const medicationsAvailable = await this.medicationRepository.findByIds(
      data.metadata.medicationPayload.map(
        (medication) => medication.medicationId,
      ),
    );

    if (medicationsAvailable.length < 1)
      throw new BadRequestException(
        `Could not get informations of medications id provided`,
      );
    try {
      const orderItems = data.metadata.medicationPayload.map(
        (item) => {
          const medication = medicationsAvailable.find(
            (m) => m.id === item.medicationId,
          );

          if (!medication)
            throw new BadRequestException(
              'Unable to find matching medications',
            );

          const unitPrice = medication.price;
          const subtotal = unitPrice * item.quantity;

          return {
            medicationId: medication.id,
            medicationName: medication.name,
            gram: medication.gram,
            quantity: item.quantity,
            unitPrice,
            subtotal,
          };
        },
      );

            const subtotal = orderItems.reduce(
              (sum, item) => sum + item.subtotal,
              0,
            );

            const deliveryFee = this.calculateDeliveryFee(data.metadata.deliveryAddress);
            const tax = subtotal * 0.075; // 7.5% VAT
            const totalAmount = subtotal + deliveryFee + tax;
console.log('totalAmount', totalAmount);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            email: data.email,
            amount: parseInt(totalAmount),
            reference: generateSecureRef(),
            metadata: {
              ...data.metadata,
              orderId: generateSecureOrderId(),
              paymentFor: PaymentForType.MEDICATIONS,
             item: orderItems,
              dateInitiated: new Date().toISOString(),
            },
          },
          { headers: this.getHeaders() },
        ),
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.response?.data?.message || 'Failed to initialize payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ! Calculate delivery fees

  private calculateDeliveryFee(address: string): number {

    console.log(address);
    // Your delivery fee calculation logic
    // Could be based on location, distance, etc.
    return 1500;
  }

  //! verify payments

  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/transaction/verify/${reference}`,
          { headers: this.getHeaders() },
        ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to verify payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //! verify webhook signatures

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  //! admin get transaction details

  async getTransaction(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transaction/${id}`, {
          headers: this.getHeaders(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to get transaction',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //! admin list all transactions details

  async listAllTransactions(params?: { perPage?: number; page?: number }) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transaction`, {
          headers: this.getHeaders(),
          params: {
            perPage: params?.perPage || 50,
            page: params?.page || 1,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to list transactions',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listTransactions(userId: string) {
    try {
      const result = await this.paymentRepository.listTransactions(userId);

      return result;
    } catch (error) {
      console.error('error', error.message);
      throw new InternalServerErrorException(
        'An error occured while listing transactions, please try again!!!',
      );
    }
  }

  async processWebhookEvent(event: any) {
    try {
      const { reference } = event.data;
      const { channel } = event.data.authorization || {};
      const {
        paymentFor,
        bookingId,
        consultantId,
        patientId,
        amountInNaira,
        orderId,
        dateInitiated,
        items,
        deliveryAddress,
        invoiceId,
        medicationPayload
      } = event.data.metadata || {};

      console.log(channel, 'event', event);

      if (paymentFor === 'bookings')
        switch (event.event) {
          case 'charge.success': {
            const existingPayment =
              await this.paymentRepository.findByReference(reference);

            if (
              existingPayment &&
              existingPayment.paymentStatus === 'success'
            ) {
              throw new BadRequestException(
                `Payment with reference ${reference} already proccessed`,
              );
            }

            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.paymentRepository.savePayment(
                {
                  bookingId,
                  consultantId,
                  amount: amountInNaira,
                  invoiceId,
                  dateInitiated,
                  paymentStatus: 'success',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                },
                patientId,
                trx,
              );

              await this.bookingRepository.updateBookingPaymentStatus(
                { paymentStatus: true, bookingId },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your deposit of ${amountInNaira} is successfull`,
                message: `You have successfully deposited ${amountInNaira} through ${channel} `,
                variant: VariantType.SUCCESS,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );

            break;
          }
          case 'charge.failed': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.paymentRepository.savePayment(
                {
                  bookingId,
                  consultantId,
                  amount: amountInNaira,
                  invoiceId,
                  dateInitiated,
                  paymentStatus: 'failed',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your deposit of ${amountInNaira}  failed`,
                message: `Your deposited of ${amountInNaira} through ${channel} may have failed due to some reasons, please try again `,
                variant: VariantType.DANGER,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );
            break;
          }

          case 'charge.pending': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.paymentRepository.savePayment(
                {
                  bookingId,
                  consultantId,
                  amount: amountInNaira,
                  invoiceId,
                  dateInitiated,
                  paymentStatus: 'pending',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your deposit of ${amountInNaira} is pending`,
                message: `Your deposited of ${amountInNaira} through ${channel} is still pending, please kindly wait while the payment for the payment to be comfirmed `,
                variant: VariantType.INFO,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );
            break;
          }

          case 'refund.processed': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.paymentRepository.updatePaymentStatus(
                { reference, status: 'refunded' },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Refund of ${amountInNaira} is proccessing`,
                message: `Your refund of ${amountInNaira} is processing, please wait while it completes `,
                variant: VariantType.INFO,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );

            break;
          }

          case 'transfer.success':
          case 'transfer.failed':
          case 'transfer.reversed': {
            break;
          }

          default:
        }
      else if (paymentFor === 'medications')
        switch (event.event) {
          case 'charge.success': {
            const existingPayment =
              await this.orderRepository.findByReference(reference);

            if (existingPayment && existingPayment.paymentStatus === 'paid') {
              throw new BadRequestException(
                `Payment with reference ${reference} already proccessed`,
              );
            }

            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.orderRepository.savePayment(
                {
                  medicationPayload,
                  deliveryAddress,
                  orderId,
                  items,
                  paymentStatus: 'success',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your deposit of ${amountInNaira} is successfull`,
                message: `You have successfully deposited ${amountInNaira} through ${channel} `,
                variant: VariantType.SUCCESS,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );

            break;
          }
          case 'charge.failed': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.orderRepository.savePayment(
                {
                  medicationPayload,
                  deliveryAddress,
                  orderId,
                  items,
                  paymentStatus: 'failed',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your deposit of ${amountInNaira}  failed`,
                message: `Your deposited of ${amountInNaira} through ${channel} may have failed due to some reasons, please try again `,
                variant: VariantType.DANGER,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );
            break;
          }

          case 'charge.pending': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.orderRepository.savePayment(
                {
                  medicationPayload,
                  deliveryAddress,
                  orderId,
                  items,
                  paymentStatus: 'pending',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your deposit of ${amountInNaira} is pending`,
                message: `Your deposited of ${amountInNaira} through ${channel} is still pending, please kindly wait while the payment for the payment to be comfirmed `,
                variant: VariantType.INFO,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );
            break;
          }

          case 'refund.processed': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.paymentRepository.updatePaymentStatus(
                { reference, status: 'refunded' },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Refund of ${amountInNaira} is proccessing`,
                message: `Your refund of ${amountInNaira} is processing, please wait while it completes `,
                variant: VariantType.INFO,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );

            break;
          }

          case 'transfer.success':
          case 'transfer.failed':
          case 'transfer.reversed': {
            break;
          }

          default:
        }

      return { message: 'success' };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw new InternalServerErrorException(
        'an error occured while trying to make payments, pleasee try again. ',
      );
    }
  }
}
