import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BlogImage } from "./index";

@Entity('blog')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type:  'text', unique: true})
  title: string;

  @Column({type: 'text'})
  content: string;

  @Column({type: 'text'})
  author: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: Date;

  @OneToOne(() => BlogImage, (blogImage) => blogImage.blog, {cascade: true, eager: true, onDelete: 'SET NULL'})
  @JoinColumn()
  imageUrl?: BlogImage;

}
