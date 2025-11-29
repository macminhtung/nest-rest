import { IsUUID } from 'class-validator';

export class AddUserToProjectDto {
  @IsUUID('7')
  userId: string;
}
