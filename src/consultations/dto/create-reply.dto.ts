import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  consultationId: string;
}