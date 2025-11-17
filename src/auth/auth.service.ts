import { Injectable } from '@nestjs/common';
import { AuthRepository } from '@src/auth/repository/auth.repository';
import { UserRepository } from '@src/users/repository/user.repository';
import crypto from 'crypto';
import qs from 'qs'
import { jwtConstants } from '@src/auth/jwtContants';
import { JwtService } from '@nestjs/jwt';
import { roleType } from '@src/users/dto/create-user.dto';
import axios from 'axios'
import { jwtDecode } from 'jwt-decode';


@Injectable()
export class AuthService {
  private clientId = process.env.GOOGLE_CLIENT_ID;
  private redirectUri =
    process.env.NODE_ENV === 'production'
      ? `${process.env.SERVER_URI}/api/v1/auth/google/callback`
      : 'http://localhost:3000/api/v1/auth/google/callback';
  constructor(private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) { }


  generateRandomPassword(length = 12): string {
    return crypto.randomBytes(length).toString('hex');
  }

  async loginUser(data: { email: string; password: string }) {
    return this.authRepository.loginUser(data);
  }

  googleAuth() {
    const scope = ['openid', 'email', 'profile'].join(' ');
    // console.log(this.redirectUri, process.env.SERVER_URI);
    const params = qs.stringify({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code', // this is key for server-side OAuth
      scope,
      access_type: 'offline', // so we get a refresh token
      prompt: 'consent', // ensures refresh token is returned every login
    });

    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    return googleUrl
  }
  async googleAuthCallback(code, ) {
    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:
          process.env.NODE_ENV === 'production'
            ? `${process.env.SERVER_URI}/api/v1/auth/google/callback`
            : 'http://localhost:3000/api/v1/auth/google/callback',
        grant_type: 'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const { id_token } = data;

    const decoded: any = jwtDecode(id_token); // <-- note the .default

    //! generate a ramdon crypto password for google users
    const googleUserPwd = this.generateRandomPassword();

    const { email, given_name, family_name, picture, email_verified } = decoded;
    const payload = {
      email,
      fullName: `${given_name} ${family_name}`,
      dp: picture,
      emailVerified: email_verified,
      password: googleUserPwd,
      authProvider: 'google',
      role: roleType.PATIENT
    };
    const user =
      await this.userRepository.createUser(payload, 'google');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: '30d',
    });

    return { user, refreshToken, accessToken }
  }

  async logoutUser(res, req) {
    return await this.authRepository.logoutUser(res, req);
  }


}
