import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Consultation } from './consultation.entity';
import { User } from "../../auth/entities/user.entity";

@Entity('replies')
export class Reply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.replies)
  user: User;

  @ManyToOne(() => Consultation, consultation => consultation.replies)
  consultation: Consultation;

  @CreateDateColumn()
  createdAt: Date;
}