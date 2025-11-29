import { IsBoolean, IsString } from 'class-validator';

export class DeleteRecordResponseDto {
  @IsBoolean()
  deleted: boolean;

  @IsString()
  message: string;
}
