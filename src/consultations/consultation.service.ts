import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from "typeorm";
import { Consultation } from './entities/consultation.entity';
import { Reply } from './entities/reply.entity';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Cron, CronExpression } from "@nestjs/schedule";
import { User } from "../auth/entities/user.entity";
import { ConsultationListItemDto } from "./dto/consultation-list-item.dto";

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(Reply)
    private replyRepository: Repository<Reply>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createConsultation(createConsultationDto: CreateConsultationDto, userId: string): Promise<Consultation> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const consultation = this.consultationRepository.create({
      ...createConsultationDto,
      user,
    });

    return this.consultationRepository.save(consultation);
  }

  async createReply(createReplyDto: CreateReplyDto, userId: string): Promise<Reply> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const consultation = await this.consultationRepository.findOne({ where: { id: createReplyDto.consultationId } });
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (consultation.isClosed) {
      throw new NotFoundException('Consultation is closed');
    }

    const reply = this.replyRepository.create({
      content: createReplyDto.content,
      user,
      consultation,
    });

    consultation.updatedAt = new Date();
    await this.consultationRepository.save(consultation);

    return this.replyRepository.save(reply);
  }

  async getConsultation(id: string): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ['user', 'replies', 'replies.user'],
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    return consultation;
  }

  async getAllConsultations(userId: string): Promise<ConsultationListItemDto[]> {
    const consultations = await this.consultationRepository
      .createQueryBuilder('consultation')
      .select(['consultation.id', 'consultation.title'])
      .where('consultation.user.id = :userId', { userId })
      .getMany();

    return consultations.map(consultation => ({
      id: consultation.id,
      title: consultation.title,
    }));
  }

  async getAllConsultationsAdmin(): Promise<ConsultationListItemDto[]> {
    const consultations = await this.consultationRepository.find({
      select: ['id', 'title'],
    });

    return consultations.map(consultation => ({
      id: consultation.id,
      title: consultation.title,
    }));
  }

  async closeInactiveConsultations(): Promise<void> {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await this.consultationRepository.update(
      {
        updatedAt: LessThan(twoDaysAgo),
        isClosed: false,
      },
      { isClosed: true },
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCloseInactiveConsultations() {
    await this.closeInactiveConsultations();
  }
}