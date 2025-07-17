import { IsString } from 'class-validator';

export class SignInResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
