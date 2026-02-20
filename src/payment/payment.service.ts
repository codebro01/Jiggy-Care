import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  HttpStatus,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
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
import { PaymentForType } from './dto/booking-paystack-Metadata.dto';
import { OrdersRepository } from '@src/order/repository/order.repository';
import { MedicationRepository } from '@src/medication/repository/medication.repository';
import { LabRepository } from '@src/lab/repository/lab.repository';
import { TestBookingRepository } from '@src/test-booking/repository/test-booking.repository';
import { TestRepository } from '@src/test/repository/test.repository';
import { InitializeTestBookingPayment } from '@src/payment/dto/initializeTestBookingPayment.dto';
import { TestBookingPaymentRepository } from '@src/test-booking-payment/repository/test-booking-payment.repository';
import { CartRepository } from '@src/cart/repository/cart.repository';
import { OneSignalService } from '@src/one-signal/one-signal.service';
import { EmailService } from '@src/email/email.service';
import { EmailTemplateType } from '@src/email/types/types';
import { SpecialityRepository } from '@src/speciality/repository/speciality.repository';
import { ConsultantRepository } from '@src/consultant/repository/consultant.repository';

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
    private readonly emailService: EmailService,
    private readonly consultantRepository: ConsultantRepository,
    private readonly oneSignalService: OneSignalService,
    private readonly bookingRepository: BookingRepository,
    private readonly orderRepository: OrdersRepository,
    private readonly medicationRepository: MedicationRepository,
    private readonly labRepository: LabRepository,
    private readonly testBookingRepository: TestBookingRepository,
    private readonly testRepository: TestRepository,
    private readonly testBookingPaymentRepository: TestBookingPaymentRepository,
    private readonly cartRepository: CartRepository,
    private readonly specialityRepository: SpecialityRepository,
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

    const booking = await this.bookingRepository.getBooking(
      data.metadata.bookingId,
      data.metadata.consultantId,
      data.metadata.userId,
    );

    // console.log(booking)

    if (!booking) throw new NotFoundException('could not find bookings');

    if (booking.paymentStatus === true)
      throw new ConflictException('Duplicate payment for booking');
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            email: data.email,
            amount: booking.pricePerSession * 100,
            reference: generateSecureRef(),
            callback_url: data.callback_url,
            metadata: {
              ...data.metadata,
              amountInNaira: booking.pricePerSession,
              invoiceId: generateSecureInvoiceId(),
              dateInitiated: new Date().toISOString(),
              paymentFor: PaymentForType.BOOKINGS,
              consultantId: data.metadata.consultantId,
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

    // ! check is cartID valid for user

    const isValidCartId = await this.cartRepository.findCartByUserId(
      data.metadata.cartId,
      data.metadata.patientId,
    );

    if (!isValidCartId) throw new BadRequestException('Invalid cart id');
    if (!isValidCartId.items) throw new NotFoundException('No item in cart');

    console.log(data.metadata.cartId, isValidCartId);

    const medicationsAvailable = await this.medicationRepository.findByIds(
      isValidCartId.items.map((medication) => medication.medicationId),
    );

    if (medicationsAvailable.length < 1)
      throw new BadRequestException(
        `Could not get informations of medications id provided`,
      );
    try {
      const orderItems = isValidCartId.items.map((item) => {
        const medication = medicationsAvailable.find(
          (m) => m.id === item.medicationId,
        );

        if (!medication)
          throw new BadRequestException('Unable to find matching medications');

        const unitPrice = medication.price;
        const subtotal = unitPrice * item.quantity;

        console.log(unitPrice, item.quantity);

        return {
          medicationId: medication.id,
          medicationName: medication.name,
          gram: medication.gram,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        };
      });

      const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

      const deliveryFee = this.calculateDeliveryFee(
        data.metadata.deliveryAddress,
      );
      const tax = subtotal * 0.075; // 7.5% VAT
      const totalAmount = subtotal + deliveryFee + tax;
      console.log('totalAmount', totalAmount);
      console.log('subtotal', subtotal);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            email: data.email,
            amount: Math.round(totalAmount) * 100,
            reference: generateSecureRef(),
            metadata: {
              ...data.metadata,
              amountInNaira: totalAmount,
              orderId: generateSecureOrderId(),
              paymentFor: PaymentForType.MEDICATIONS,
              items: orderItems,
              dateInitiated: new Date().toISOString(),
              cartId: isValidCartId.id,
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
  async initializeTestBookingPayment(data: {
    email: string;
    metadata: InitializeTestBookingPayment & { patientId: string };
  }) {
    if (!data)
      throw new BadRequestException(
        'Required payload for payment not provided',
      );

    const bookedDate = new Date(data.metadata.date);
    bookedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookedDate < today)
      throw new BadRequestException(
        'You cannot book a test appointment in the past',
      );

    try {
      const testBooking = await this.testBookingRepository.findOne(
        data.metadata.testBookingId,
        data.metadata.patientId,
      );

      console.log(data.metadata.patientId, data.metadata.testBookingId);

      console.log('testBooking', testBooking);

      if (!testBooking)
        throw new BadRequestException(`Invalid  test type provided!!!`);

      if (testBooking.labId !== null) {
        const checkIsValidLab = await this.labRepository.findOne(
          testBooking.labId,
        );
        if (!checkIsValidLab)
          throw new BadRequestException(`Invalid  lab provided!!!`);
      }

      const test = await this.testRepository.findOne(testBooking.testId);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            email: data.email,
            amount:
              testBooking.collection === 'home_collection'
                ? test.amount * 100 + 250000
                : test.amount * 100,
            reference: generateSecureRef(),
            metadata: {
              ...data.metadata,
              testBookingId: data.metadata.testBookingId,
              testId: testBooking.testId,
              labId: testBooking.labId,
              invoiceId: generateSecureInvoiceId(),
              paymentFor: PaymentForType.TEST_BOOKINGS,
              amountInNaira: test.amount,
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
    // Could be based on location, distance, etc.
    return 0; // in kobo
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
      const { reference, email} = event.data;
      const { channel } = event.data.authorization || {};
      const {
        paymentFor,
        bookingId,
        consultantId,
        patientId,
        amountInNaira,
        orderId,
        cartId,
        dateInitiated,
        items,
        deliveryAddress,
        invoiceId,
        testBookingId,
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
            const [consultant, booking] = await Promise.all([
              this.consultantRepository.findApprovedConsultantById(
                consultantId,
              ),
              this.bookingRepository.getBooking(
                bookingId,
                consultantId,
                patientId,
              ),
            ]);
            console.log('fetched consultant detials and campaign here');
            if (
              consultant.speciality === null ||
              consultant.speciality === undefined
            )
              throw new NotFoundException(
                'Could not get consultant speciality',
              );
            if (!consultant.email)
              throw new NotFoundException('Could not get consultant email');
            const speciality = await this.specialityRepository.findOne(
              consultant.speciality,
            );

            const adjustedDate = new Date(
              booking.appointmentDate.getTime() + 60 * 60 * 1000,
            );

            const dayName = adjustedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              timeZone: 'Africa/Lagos',
            });

            const time = adjustedDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Africa/Lagos',
            });

            const formattedDate = `${dayName} at ${time}`;

            console.log('appointment date', booking.appointmentDate);

            try {
              const [
                PatientNotification,
                consultantNotification,
                consultantPushNotification,
                patientInvoice,
              ] = await Promise.all([
                this.notificationService.createNotification(
                  {
                    title: `Appointment Booking is Successful`,
                    message: `You have successfully paid the sum of ${amountInNaira} through ${channel} to book an appointment with a Medical Consultant that is scheduled to hold on ${formattedDate}`,
                    variant: VariantType.SUCCESS,
                    category: CategoryType.BOOKING,
                    priority: '',
                    status: StatusType.UNREAD,
                  },
                  patientId,
                ),
                this.notificationService.createNotification(
                  {
                    title: `NEW BOOKING`,
                    message: `You have a new appointment on ${formattedDate}`,
                    variant: VariantType.SUCCESS,
                    category: CategoryType.BOOKING,
                    priority: '',
                    status: StatusType.UNREAD,
                  },
                  consultantId,
                ),
                // send push notification to consultant for booking

                this.oneSignalService.sendNotificationToUser(
                  consultantId,
                  'New Appointment',
                  `You have a new appointment on ${formattedDate}`,
                  {
                    category: 'BOOKING',
                    action: 'view_booking',
                  },
                ),

                this.emailService.queueTemplatedEmail(
                  EmailTemplateType.APPOINTMENT_SUMMARY,
                  email,
                  {
                    invoiceNo: invoiceId,
                    appointmentDate: booking.appointmentDate,
                    amountPaid: amountInNaira,
                    invoiceStatus: 'Paid',
                    consultantName: `${speciality.prefix} ${consultant.fullName}`,
                  },
                ),
              ]);

              console.log(
                'Alls notifications created:',
                PatientNotification,
                consultantNotification,
                consultantPushNotification,
                patientInvoice,
              );
            } catch (error) {
              console.error('Error creating notifications:', error);
            }
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
                category: CategoryType.BOOKING,
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
                category: CategoryType.BOOKING,
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
                category: CategoryType.BOOKING,
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
      else if (paymentFor === 'medications') {
        switch (event.event) {
          case 'charge.success': {
            // console.log('got into success')
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
                  deliveryAddress,
                  orderId,
                  items,
                  paymentStatus: 'success',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                  amount: amountInNaira,
                  cartId,
                },
                patientId,
                trx,
              );
              // console.log('savePayment', savePayment)
            });

            await this.notificationService.createNotification(
              {
                title: `Your payment of ${amountInNaira} is successfull`,
                message: `You have successfully ordered this medication. Amount: ${amountInNaira}, Channel of Payment: ${channel} `,
                variant: VariantType.SUCCESS,
                category: CategoryType.ORDER,
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
                  cartId,
                  deliveryAddress,
                  orderId,
                  items,
                  paymentStatus: 'failed',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                  amount: amountInNaira,
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your payment of ${amountInNaira}  failed`,
                message: `Your payment of ${amountInNaira} through ${channel} may have failed due to some reasons, please try again `,
                variant: VariantType.DANGER,
                category: CategoryType.ORDER,
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
                  deliveryAddress,
                  orderId,
                  items,
                  paymentStatus: 'pending',
                  paymentMethod: channel,
                  reference,
                  transactionType: 'deposit',
                  amount: amountInNaira,
                  cartId,
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your payment of ${amountInNaira} is pending`,
                message: `Your payment of ${amountInNaira} through ${channel} is still pending, please kindly wait while the payment for the payment to be comfirmed `,
                variant: VariantType.INFO,
                category: CategoryType.ORDER,
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
                category: CategoryType.ORDER,
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
      } else if (paymentFor === 'test_bookings')
        switch (event.event) {
          case 'charge.success': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.testBookingPaymentRepository.savePayment(
                {
                  paymentMethod: channel,
                  reference,
                  invoiceId,
                  testBookingId,
                  paymentStatus: 'PAID',
                  amount: amountInNaira,
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your payment of ${amountInNaira} is successfull`,
                message: `Your test booking is successful ${amountInNaira}, Channel of Payment: ${channel} `,
                variant: VariantType.SUCCESS,
                category: CategoryType.ORDER,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );

            break;
          }
          case 'charge.failed': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.testBookingPaymentRepository.savePayment(
                {
                  paymentMethod: channel,
                  reference,
                  invoiceId,
                  testBookingId,
                  paymentStatus: 'PAID',
                  amount: amountInNaira,
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your payment of ${amountInNaira}  failed`,
                message: `Your payment of ${amountInNaira} through ${channel} may have failed due to some reasons, please try again `,
                variant: VariantType.DANGER,
                category: CategoryType.ORDER,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );
            break;
          }

          case 'charge.pending': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.testBookingPaymentRepository.savePayment(
                {
                  paymentMethod: channel,
                  reference,
                  invoiceId,
                  testBookingId,
                  paymentStatus: 'PAID',
                  amount: amountInNaira,
                },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Your payment of ${amountInNaira} is pending`,
                message: `Your payment of ${amountInNaira} through ${channel} is still pending, please kindly wait while the payment for the payment to be comfirmed `,
                variant: VariantType.INFO,
                category: CategoryType.ORDER,
                priority: '',
                status: StatusType.UNREAD,
              },
              patientId,
            );
            break;
          }

          case 'refund.processed': {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.testBookingRepository.updatePaymentStatus(
                { reference, paymentStatus: 'refunded' },
                patientId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Refund of ${amountInNaira} is proccessing`,
                message: `Your refund of ${amountInNaira} is processing, please wait while it completes `,
                variant: VariantType.INFO,
                category: CategoryType.ORDER,
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
