import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Blog, BlogImage } from "./entities";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports:[
    TypeOrmModule.forFeature([Blog, BlogImage]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [TypeOrmModule, BlogService]
})
export class BlogModule {}
