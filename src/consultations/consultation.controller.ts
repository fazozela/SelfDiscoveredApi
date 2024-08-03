import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { Auth } from "../auth/decorators";
import { ConsultationListItemDto } from "./dto/consultation-list-item.dto";

@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Auth()
  @Post()
  createConsultation(@Body() createConsultationDto: CreateConsultationDto, @GetUser() user: User) {
    return this.consultationService.createConsultation(createConsultationDto, user.id);
  }

  @Auth()
  @Post('reply')
  createReply(@Body() createReplyDto: CreateReplyDto, @GetUser() user: User) {
    return this.consultationService.createReply(createReplyDto, user.id);
  }

  @Auth()
  @Get('all')
  getAllConsultationsAdmin(): Promise<ConsultationListItemDto[]> {
    return this.consultationService.getAllConsultationsAdmin();
  }

  @Auth()
  @Get()
  getAllConsultations(@GetUser() user: User): Promise<ConsultationListItemDto[]> {
    return this.consultationService.getAllConsultations(user.id);
  }

  @Auth()
  @Get(':id')
  getConsultation(@Param('id') id: string) {
    return this.consultationService.getConsultation(id);
  }
}