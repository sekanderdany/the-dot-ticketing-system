import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Hardcoded test user
  private readonly testUser = {
    id: 'test-id',
    email: 'testuser@example.com',
    username: 'testuser',
    password: 'testpass',
    role: 'TEST',
  };

  async validateUser(email: string, password: string): Promise<any> {
    if (
      (email === this.testUser.email || email === this.testUser.username) &&
      password === this.testUser.password
    ) {
      const { password, ...result } = this.testUser;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      username: user.username,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    // No DB storage for refresh token in test mode
    return { accessToken, refreshToken };
  }
}
