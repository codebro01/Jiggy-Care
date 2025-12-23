import { Module } from '@nestjs/common';
import { DbModule } from '@src/db/db.module';
import { PasswordResetRepository } from '@src/password-reset/repository/password-reset.repository';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { UserModule } from '@src/users/users.module';
import { EmailModule } from '@src/email/email.module';

@Module({
    imports: [DbModule, UserModule, EmailModule], 
    providers:[PasswordResetRepository, PasswordResetService], 
    exports:[PasswordResetRepository], controllers: [PasswordResetController]
})
export class PasswordResetModule {}
