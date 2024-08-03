import { IsString, IsNotEmpty } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}