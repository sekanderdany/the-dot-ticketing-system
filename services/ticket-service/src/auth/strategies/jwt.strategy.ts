import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // For microservices, we trust the JWT payload from the auth service
    // The auth service has already validated the user exists and is active
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username || payload.email,
      role: payload.role || 'CLIENT',
      isActive: true,
      isVerified: true,
    };
  }
}
