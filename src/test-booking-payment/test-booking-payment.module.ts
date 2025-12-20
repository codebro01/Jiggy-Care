import { Module } from '@nestjs/common';
import { TestBookingPaymentRepository } from '@src/test-booking-payment/repository/test-booking-payment.repository';
import { DbModule } from '@src/db/db.module';


@Module({
    imports: [DbModule], 
    providers:[TestBookingPaymentRepository],
    exports:[TestBookingPaymentRepository]
})
export class TestBookingPaymentModule {

}
