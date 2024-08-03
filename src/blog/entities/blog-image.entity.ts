import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Blog } from "./index";

@Entity({name: 'blog-image'})
export class BlogImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  url: string;

  @OneToOne(() => Blog, (blog) => blog.imageUrl)
  blog: Blog;
}