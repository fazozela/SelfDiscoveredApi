import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Consultation } from "../../consultations/entities/consultation.entity";
import { Reply } from "../../consultations/entities/reply.entity";

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'text', unique: true})
  email: string;

  @Column({type: 'text', select: false})
  password: string;

  @Column({type: 'bool', default: true})
  isActive: boolean;

  @Column({ type: 'text', array: true, default: ['user'] })
  roles: string[];

  @OneToMany(() => Consultation, consultation => consultation.user)
  consultations: Consultation[];

  @OneToMany(() => Reply, reply => reply.user)
  replies: Reply[];

  @BeforeInsert()
  checkFieldsBeforeInsert(){
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate(){
    this.checkFieldsBeforeInsert();
  }
}
