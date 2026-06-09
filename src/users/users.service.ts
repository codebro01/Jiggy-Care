import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '@src/users/repository/user.repository';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import { UpdatePatientDto } from '@src/users/dto/updatePatient.dto';
import { CreateUserDto } from '@src/users/dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from '@src/auth/jwtContants';
import { consultantTable, patientTable, UserType } from '@src/db/users';
import { JwtService } from '@nestjs/jwt';
import { HelperRepository } from '@src/helpers/repository/helpers.repository';
import { roleType } from '@src/users/dto/createUser.dto';
import { UpdateConsultantDto } from '@src/consultant/dto/updateConsultantDto';
import { EmailVerificationService } from '@src/email-verification/email-verification.service';
import { BookingRepository } from '@src/booking/repository/booking.repository';
import { TestResultRepository } from '@src/test-result/repository/test-result.repository';
import { PrescriptionRepository } from '@src/prescription/repository/prescription.repository';
import PDFDocument from 'pdfkit';
import { NotificationService } from '@src/notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly helperRepository: HelperRepository,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly bookingRepository: BookingRepository,
    private readonly testResultRepository: TestResultRepository,
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly notificationService: NotificationService,
    private jwtService: JwtService,
  ) {}

  async createUser(data: CreateUserDto, authProvider: string): Promise<any> {
    try {
      const { email, password } = data;
      if (!email || !password)
        throw new BadRequestException('Please email and password is required');
      const hashedPwd = await bcrypt.hash(password, 10);

      //!  check if google user is already in db before signing up

      if (authProvider === 'google') {
        const user = await this.userRepository.findUserByEmail(email);
        if (user) {
          const payload = { id: user.id, email: user.email, role: user.role };

          const accessToken = await this.jwtService.signAsync(payload, {
            secret: jwtConstants.accessTokenSecret,
            expiresIn: '1h',
          });
          const refreshToken = await this.jwtService.signAsync(payload, {
            secret: jwtConstants.refreshTokenSecret,
            expiresIn: '30d',
          });

          const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

          const updateUserToken =
            await this.userRepository.updateUserTokenByUserId(
              hashedRefreshToken,
              user.id,
            );

          if (!updateUserToken) throw new InternalServerErrorException();
          return { user, accessToken, refreshToken };
        }
      }

      //! check if email provided has been used

      const isEmailUsed = await this.userRepository.findUserByEmail(email);
      if (isEmailUsed)
        throw new ConflictException(
          'Email already used, please use another email!',
        );

      if (!data.otp)
        throw new BadRequestException(
          'Please provide the OTP sent to your email',
        );

      const verifyEmail = await this.emailVerificationService.verifyOTP(
        { OTP: data.otp },
        email,
      );

      if (!verifyEmail)
        throw new BadRequestException(
          'Could not verify email, please try again!',
        );

      let user: UserType;

      switch (data.role) {
        case roleType.PATIENT:
          user = await this.helperRepository.executeInTransaction(
            async (trx) => {
              const user = await this.userRepository.createUser(
                { ...data, password: hashedPwd, emailVerified: true },
                authProvider,
                trx,
              );

              if (!user)
                throw new InternalServerErrorException(
                  'An error occured while inserting user',
                );
              await trx
                .insert(patientTable)
                .values({ userId: user.id })
                .returning();

              return user;
            },
          );
          break;

        case roleType.CONSULTANT:
          user = await this.helperRepository.executeInTransaction(
            async (trx) => {
              const user = await this.userRepository.createUser(
                { ...data, password: hashedPwd, emailVerified: true },
                authProvider,
                trx,
              );

              if (!user)
                throw new InternalServerErrorException(
                  'An error occured while inserting user',
                );

              await trx
                .insert(consultantTable)
                .values({ userId: user.id })
                .returning();

              return user;
            },
          );
          break;

        // case roleType.ADMIN: (

        //   user = await this.helperRepository.executeInTransaction(async (trx) => {

        //    const admin = await this.userRepository.createUser({ ...data, password: hashedPwd }, authProvider, trx)

        //     if (!admin) throw new InternalServerErrorException('An error occured while inserting user')

        //    return admin;

        //  })
        // )
        // break;

        default:
          throw new BadRequestException(
            'Role can either be consultant or patient',
          );
      }

      //! create user here if email has not been used

      // console.log('user was succesfully created', user)
      if (!user)
        throw new InternalServerErrorException(
          'Could not create user, please try again',
        );

      const payload = { id: user.id, email: user.email, role: user.role };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.accessTokenSecret,
        expiresIn: '1h',
      });
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshTokenSecret,
        expiresIn: '30d',
      });

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      const updateUserToken = await this.userRepository.updateUserTokenByUserId(
        hashedRefreshToken,
        user.id,
      );

      if (!updateUserToken) throw new InternalServerErrorException();
      // console.log('got past this unreachable code')
      return { user, accessToken, refreshToken };
    } catch (dbError) {
      console.error('DB Insert Error:', dbError);

      // rollback Supabase user if DB fails

      throw dbError;
    }
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await this.userRepository.getAllUsers();
    return users;
  }

  async updatePatient(data: UpdatePatientDto, userId: string) {
    if (!data) throw new BadRequestException('Data not provided for update!');
    const patient = await this.userRepository.findPatientById(userId);

    if (!patient) throw new NotFoundException('No user found');

    console.log(data, patient);

    const updatedPatient = await this.helperRepository.executeInTransaction(
      async (trx) => {
        const user = await this.userRepository.updateUser(
          {
            fullName: data.fullName || patient.fullName,
            dateOfBirth: data.dateOfBirth || patient.dateOfBirth,
            gender: data.gender || patient.gender,
            phone: data.phone || patient.phone,
            address: data.address || patient.address,
          },
          userId,
          trx,
        );

        const userPatient = await this.userRepository.updatePatientById(
          {
            emergencyContact: data.emergencyContact || patient.emergencyContact,
            weight: data.weight,
            height: data.height,
            bloodType: data.bloodType,
          },
          userId,
          trx,
        );

        return { ...user, ...userPatient };
      },
    );
    return updatedPatient;
  }
  async updateConsultant(data: UpdateConsultantDto, userId: string) {
    console.log('user', userId);
    if (!data) throw new BadRequestException('Data not provided for update!');
    const consultant =
      await this.userRepository.findApprovedConsultantById(userId);

    if (!consultant) throw new NotFoundException('No user found');

    const updatedConsultant = await this.helperRepository.executeInTransaction(
      async (trx) => {
        const user = await this.userRepository.updateUser(
          {
            fullName: data.fullName || consultant.fullName,
            dateOfBirth: data.dateOfBirth || consultant.dateOfBirth,
            gender: data.gender || consultant.gender,
            phone: data.phone || consultant.phone,
            address: data.address || consultant.address,
          },
          userId,
          trx,
        );
        const userConsultant = await this.userRepository.updateConsultantById(
          {
            availability: data.availability || consultant.availability,
            // speciality: data?.speciality || consultant.speciality,
            yrsOfExperience: data.yrsOfExperience || consultant.yrsOfExperience,
            about: data.about || consultant.about,
            languages: data.languages || consultant.languages,
            certification: data.certification || consultant.certification,
            workingHours: data.workingHours || consultant.workingHours,
            speciality: data.speciality || consultant.speciality,
          },
          userId,
          trx,
        );

        return { ...user, ...userConsultant };
      },
    );

    // console.log('updatedUser', updatedUser);
    return updatedConsultant;
  }

  async getPatientProfile(userId: string) {
    const patient = await this.userRepository.findPatientById(userId);
    const notificationCount =
      await this.notificationService.getNotificationsCount(userId);

    return { patient, notificationCount };
  }
  async getConsultantProfile(userId: string) {
    console.log('userId', userId);
    const consultant =
      await this.userRepository.findApprovedConsultantById(userId);

    return consultant;
  }

  async updateFcmToken(userId: string, token: string) {
    return this.userRepository.updateFcmToken(userId, token);
  }

  async clearFcmToken(userId: string) {
    await this.userRepository.updateFcmToken(userId, null);
  }

  async profileCards(patientId: string) {
    const [totalBookings, totalReports, activeMeds] = await Promise.all([
      this.bookingRepository.totalBookings(patientId),
      this.testResultRepository.totalTests(patientId),
      this.prescriptionRepository.totalActivePresciptions(patientId),
    ]);

    return {
      appointments: totalBookings,
      reports: totalReports,
      activeMeds,
    };
  }

  async updateUserDp(dpUrl: string, userId: string) {
    const user = await this.userRepository.updateUserDp(dpUrl, userId);

    if (user.role === 'patient') {
      return await this.userRepository.findPatientById(user.id);
    } else if (user.role === 'consultant') {
      return await this.userRepository.findApprovedConsultantById(user.id);
    } else {
      return {};
    }
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.deleteUser(userId);

    if (!user) throw new BadRequestException('Could not deleted user');
    return user;
  }

  // ! adding pdf download kit

  async generatePatientHealthPdf(patientId: string): Promise<Buffer> {
    // 1. Fetch patient profile + health data in parallel
    const [patient, [healthData]] = await Promise.all([
      this.userRepository.findPatientById(patientId),
      this.userRepository.getUserHealthData(patientId),
    ]);

    if (!patient) throw new NotFoundException('Patient not found');

    // 2. Build the PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: any) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#1a5276';
      const mutedColor = '#7f8c8d';
      const lineColor = '#d5d8dc';

      // ── Header ──────────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('Patient Health Report', { align: 'center' });

      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .font('Helvetica')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.moveDown(1.5);

      // ── Patient Info ─────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Patient Information');

      doc
        .moveTo(50, doc.y + 4)
        .lineTo(550, doc.y + 4)
        .strokeColor(lineColor)
        .stroke();

      doc.moveDown(0.5);

      const infoFields: [string, string | null | undefined][] = [
        ['Full Name', patient.fullName],
        ['Email', patient.email],
        ['Phone', patient.phone],
        [
          'Date of Birth',
          patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toDateString()
            : null,
        ],
        ['Gender', patient.gender],
        ['Address', patient.address],
        ['Blood Type', patient.bloodType],
        ['Height', patient.height ? `${patient.height} cm` : null],
        ['Weight', patient.weight ? `${patient.weight} kg` : null],
        [
          'Emergency Contact',
          patient.emergencyContact
            ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) — ${patient.emergencyContact.phone}`
            : 'No emergency contact',
        ],
      ];

      for (const [label, value] of infoFields) {
        if (!value) continue;
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#2c3e50')
          .text(`${label}: `, { continued: true });
        doc.font('Helvetica').fillColor('#555').text(value);
      }

      doc.moveDown(1.5);

      // ── Health Readings ──────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Health Readings');

      doc
        .moveTo(50, doc.y + 4)
        .lineTo(550, doc.y + 4)
        .strokeColor(lineColor)
        .stroke();

      doc.moveDown(0.5);

      if (!healthData) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(mutedColor)
          .text('No health readings recorded yet.');
      } else {
        // Temperature
        if (healthData.temperature) {
          this.renderReadingSection(doc, 'Temperature', [
            ['Value', `${healthData.temperature.value} °C`],
            ['Status', healthData.temperature.status ?? 'N/A'],
            ['Note', healthData.temperature.note ?? 'N/A'],
          ]);
        }

        // Heart Rate
        if (healthData.heartRate) {
          this.renderReadingSection(doc, 'Heart Rate', [
            ['Value', `${healthData.heartRate.value} bpm`],
            ['Status', healthData.heartRate.status ?? 'N/A'],
            ['Note', healthData.heartRate.note ?? 'N/A'],
          ]);
        }

        // Weight
        if (healthData.weight) {
          this.renderReadingSection(doc, 'Weight', [
            ['Value', `${healthData.weight.value} kg`],
            ['Status', healthData.weight.status ?? 'N/A'],
            ['Note', healthData.weight.note ?? 'N/A'],
          ]);
        }

        // Blood Pressure (array — render each entry)
        if (healthData.bloodPressure?.length) {
          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#2c3e50')
            .text('Blood Pressure History');
          doc.moveDown(0.3);

          healthData.bloodPressure.forEach((entry: any, index: any) => {
            doc
              .font('Helvetica-Bold')
              .fontSize(10)
              .fillColor(mutedColor)
              .text(
                `Entry ${index + 1}${entry.date ? ` — ${entry.date}` : ''}:`,
              );

            this.renderReadingSection(doc, null, [
              ['Systolic', `${entry.systolic} mmHg`],
              ['Diastolic', `${entry.diastolic} mmHg`],
              ['Status', entry.status ?? 'N/A'],
              ['Note', entry.note ?? 'N/A'],
            ]);
          });
        }
      }

      // ── Footer ───────────────────────────────────────────────
      doc
        .moveDown(2)
        .fontSize(8)
        .fillColor(mutedColor)
        .font('Helvetica')
        .text(
          'This report is auto-generated and intended for personal records only.',
          {
            align: 'center',
          },
        );

      doc.end();
    });
  }

  // Helper to render a named reading block
  private renderReadingSection(
    doc: PDFKit.PDFDocument,
    title: string | null,
    fields: [string, string][],
  ) {
    if (title) {
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#2c3e50').text(title);
    }

    for (const [label, value] of fields) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#555')
        .text(`  ${label}: `, { continued: true });
      doc.font('Helvetica').text(value);
    }

    doc.moveDown(0.8);
  }
}
