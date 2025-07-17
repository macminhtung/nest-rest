import { UnauthorizedException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { VerifyErrors, SignOptions } from 'jsonwebtoken';
import type { TEnvConfiguration } from '@/config';

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService<TEnvConfiguration>) {
    // Update jwtSecretKey
    this.jwtSecretKey = this.configService.get('jwtSecretKey')!;
  }
  private jwtSecretKey: TEnvConfiguration['jwtSecretKey'];

  decodeToken(token: string) {
    return jwt.decode(token, { json: true });
  }

  signPayload(payload: object, options?: SignOptions) {
    // Sign the payload with secretKey
    return jwt.sign(payload, this.jwtSecretKey, options || { expiresIn: '24h' });
  }

  verifyToken(token: string) {
    // Verify token
    jwt.verify(token, this.jwtSecretKey, (err: VerifyErrors) => {
      if (err) throw new UnauthorizedException({ message: err.message });
    });

    // Decode token
    return this.decodeToken(token);
  }
}
