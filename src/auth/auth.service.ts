import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import { UserRepository } from '@src/users/repository/user.repository';
import crypto from 'crypto';
import qs from 'qs';
import { jwtConstants } from '@src/auth/jwtContants';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { HelperRepository } from '@src/helpers/repository/helpers.repository';
import { PatientRepository } from '@src/patient/repository/patient.repository';
import { ConsultantRepository } from '@src/consultant/repository/consultant.repository';
import { GoogleAuthService } from '@src/google-auth/google-auth.service';
import * as bcrypt from 'bcrypt';
import { GoogleMobileSigninDto } from '@src/auth/dto/google-mobile-signin.dto';
import { roleType } from '@src/users/dto/createUser.dto';

@Injectable()
export class AuthService {
  private clientId = process.env.GOOGLE_CLIENT_ID;
  private redirectUri =
    process.env.NODE_ENV === 'production'
      ? `${process.env.SERVER_URI}/api/v1/auth/google/callback`
      : 'http://localhost:3000/api/v1/auth/google/callback';
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly helperRepository: HelperRepository,
    private readonly patientRepository: PatientRepository,
    private readonly consultantRepository: ConsultantRepository,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  generateRandomPassword(length = 12): string {
    return crypto.randomBytes(length).toString('hex');
  }

  async loginUser(data: { email: string; password: string }) {
    const { email, password } = data;

    if (!email || !password)
      throw new BadRequestException('Please provide email and password');
    const user = await this.authRepository.findUserByEmail(email);
    if (!user)
      throw new UnauthorizedException(
        'Bad credentials, Please check email and password',
      );
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect)
      throw new UnauthorizedException(
        'Bad credentials, Please check email and password',
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

    const updateUserToken = await this.authRepository.updateUserRefreshToken(
      hashedRefreshToken,
      user.id,
    );

    let userInfo;

    if (user.role === 'patient') {
      userInfo = await this.userRepository.findPatientById(user.id);
    } else if (user.role === 'consultant') {
      userInfo = await this.userRepository.findApprovedConsultantById(user.id);
    } else {
      userInfo = user;
    }

    if (!updateUserToken) throw new InternalServerErrorException();
    return { user: userInfo, accessToken, refreshToken };
  }

  async logoutUser(userId: string) {
    await this.authRepository.updateUserRefreshToken(null, userId);
  }

  // * Google auth for mobile

  async googleMobileAuth(data: GoogleMobileSigninDto) {
    let googlePayload;
    try {
      googlePayload = await this.googleAuthService.verifyIdToken(data.idToken);

      console.log('googlePayload', googlePayload);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Your request token is invalid');
    }
    if (!googlePayload.email) throw new BadRequestException('Invalid Email');

    //! generate a ramdon crypto password for google users
    const googleUserPwd = this.generateRandomPassword();
    const hashedGoogleUserPwd = await bcrypt.hash(googleUserPwd, 10);
    const { email, given_name, family_name, email_verified } = googlePayload;
    const payload = {
      email,
      fullName: `${given_name} ${family_name}`,
      dp: googlePayload.picture,
      emailVerified: email_verified,
      password: hashedGoogleUserPwd,
      authProvider: 'google',
      role: data.role,
    };
    const user = await this.authRepository.findUserByEmail(email);
    let jwtPayload;

    if (user) {
      jwtPayload = {
        email: user.email,
        role: user.role,
        id: user.id,
      };

      if (user.role === 'patient') {
        const patientInfo = await this.userRepository.findPatientById(user.id);
        const accessToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        });

        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        });

                const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.authRepository.updateUserRefreshToken(hashedRefreshToken, user.id);

        return { user: patientInfo, refreshToken, accessToken };
      }
      if (user.role === 'consultant') {
        const consultantInfo =
          await this.userRepository.findApprovedConsultantById(user.id);
        const accessToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        });

        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        });

                const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.authRepository.updateUserRefreshToken(
          hashedRefreshToken,
          user.id,
        );

        return { user: consultantInfo, refreshToken, accessToken };
      }
    }

    switch (data.role) {
      case roleType.PATIENT: {
        const user = await this.helperRepository.executeInTransaction(
          async (trx) => {
            const patient = await this.userRepository.createUser(
              payload,
              'google',
              trx,
            );
            await this.patientRepository.createPatient(patient.id, trx);
            return patient;
          },
        );

        const jwtPayload = {
          email: user.email,
          role: user.role,
          id: user.id,
        };

        const patientInfo = await this.userRepository.findPatientById(user.id);

        const accessToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        });

        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);


        await this.authRepository.updateUserRefreshToken(
          hashedRefreshToken,
          user.id,
        );

        return { user: patientInfo, refreshToken, accessToken };
      }

      case roleType.CONSULTANT: {
        const user = await this.helperRepository.executeInTransaction(
          async (trx) => {
            const consultant = await this.userRepository.createUser(
              payload,
              'google',
              trx,
            );
            await this.consultantRepository.createConsultant(
              consultant.id,
              trx,
            );
            return consultant;
          },
        ); // ← Fixed: closing parenthesis right after the callback

        const jwtPayload = {
          email: user.email,
          role: user.role,
          id: user.id,
        };

        const consultantInfo =
          await this.userRepository.findApprovedConsultantById(user.id);
        const accessToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        });

        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        });
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.authRepository.updateUserRefreshToken(
          hashedRefreshToken,
          user.id,
        );

        return { user: consultantInfo, refreshToken, accessToken };
      }

      default:
        throw new BadRequestException('Invalid role type');
    }
  }

  // * Google auth for web

  googleWebAuth(state: any) {
    const scope = ['openid', 'email', 'profile'].join(' ');
    // console.log(this.redirectUri, process.env.SERVER_URI);
    console.log(this.redirectUri);
    const params = qs.stringify({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code', // this is key for server-side OAuth
      scope,
      access_type: 'offline', // so we get a refresh token
      prompt: 'consent', // ensures refresh token is returned every login
      state,
    });

    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    return googleUrl;
  }
  async googleAuthCallbackForWeb(code: string, state: string) {
    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:
          process.env.NODE_ENV === 'production'
            ? this.redirectUri
            : 'http://localhost:3000/api/v1/auth/google/callback',
        grant_type: 'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const { id_token } = data;
    const decodedState = JSON.parse(
      Buffer.from(state, 'base64').toString('utf-8'),
    );
    const { role } = decodedState;
    // console.log('decodedState', decodedState, data)

    const googlePayload = await this.googleAuthService.verifyIdToken(id_token);

    if (!googlePayload.email) throw new BadRequestException('Invalid Email');

    //! generate a ramdon crypto password for google users
    const googleUserPwd = this.generateRandomPassword();
    const hashedGoogleUserPwd = await bcrypt.hash(googleUserPwd, 10);
    const { email, given_name, family_name, picture, email_verified } =
      googlePayload;
    const payload = {
      email,
      fullName: `${given_name} ${family_name}`,
      dp: picture,
      emailVerified: email_verified,
      password: hashedGoogleUserPwd,
      authProvider: 'google',
      role,
    };
    const user = await this.authRepository.findUserByEmail(email);
    let jwtPayload;

    if (user) {
      jwtPayload = {
        email: user.email,
        role: user.role,
        id: user.id,
      };

      if (user.role === 'patient') {
        const patientInfo = await this.userRepository.findPatientById(user.id);
        const accessToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        });

        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        });
                const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.authRepository.updateUserRefreshToken(
          hashedRefreshToken,
          user.id,
        );

        return { user: patientInfo, refreshToken, accessToken };
      }
      if (user.role === 'consultant') {
        const consultantInfo =
          await this.userRepository.findApprovedConsultantById(user.id);
        const accessToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        });

        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        });
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
        await this.authRepository.updateUserRefreshToken(
          hashedRefreshToken,
          user.id,
        );

        return { user: consultantInfo, refreshToken, accessToken };
      }
    }

    switch (role) {
      case roleType.PATIENT: {
       

       const user = await this.helperRepository.executeInTransaction(async (trx) => {
          const patient = await this.userRepository.createUser(
            payload,
            'google',
            trx,
          );
          await this.patientRepository.createPatient(patient.id, trx);
          return patient;
        });

       const jwtPayload = {
          email: user.email,
          role: user.role,
          id: user.id,
        };

        const patientInfo = await this.userRepository.findPatientById(user.id);

        const accessToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        });

        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        });
                const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.authRepository.updateUserRefreshToken(
          hashedRefreshToken,
          user.id,
        );

        return { user: patientInfo, refreshToken, accessToken };
      }

      case roleType.CONSULTANT: {
      
        const user = await this.helperRepository.executeInTransaction(async (trx) => {
          const consultant = await this.userRepository.createUser(
            payload,
            'google',
            trx,
          );
          await this.consultantRepository.createConsultant(consultant.id, trx);
          return consultant;
        }); // ← Fixed: closing parenthesis right after the callback

      const  jwtPayload = {
          email: user.email,
          role: user.role,
          id: user.id,
        };

        const consultantInfo =
          await this.userRepository.findApprovedConsultantById(user.id);

        const accessToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        });

        const refreshToken = await this.jwtService.signAsync(jwtPayload, {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        });

        await this.authRepository.updateUserRefreshToken(refreshToken, user.id);

        return { user: consultantInfo, refreshToken, accessToken };
      }

      default:
        throw new BadRequestException('Invalid role type');
    }
  }

  async verifyRefreshTokenForMobile(refresh_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: jwtConstants.refreshTokenSecret,
      });

      if (!payload) throw new UnauthorizedException('Unauthorized');

      const { email, id, role } = payload;

      const user = await this.authRepository.findUserRefreshTokenByUserId(id);
      console.log(user, payload);
      if (!user.refreshToken)
        throw new UnauthorizedException('User not authorized');

      const compareRefreshToken = await bcrypt.compare(
        refresh_token,
        user.refreshToken,
      );
      console.log('compareRefreshToken', compareRefreshToken);
      if (!compareRefreshToken)
        throw new UnauthorizedException('User not authorized');

      const newAccessToken = await this.jwtService.signAsync(
        { email, id, role },
        {
          secret: jwtConstants.accessTokenSecret,
          expiresIn: '1h',
        },
      );

      const newRefreshToken = await this.jwtService.signAsync(
        { email, id, role },
        {
          secret: jwtConstants.refreshTokenSecret,
          expiresIn: '30d',
        },
      );

      const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

      await this.authRepository.updateUserRefreshToken(
        hashedNewRefreshToken,
        id,
      );

      return { newAccessToken, newRefreshToken };
    } catch (error) {
      console.log(error);
    }
  }
}
