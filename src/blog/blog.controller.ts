import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException, Res
} from "@nestjs/common";
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from "./helpers";
import { ConfigService } from "@nestjs/config";
import { Response } from 'express';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly configService: ConfigService
  ) {}

  @Get('file/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName')
      imageName: string
  ){
    const path = this.blogService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post()
  @UseInterceptors(FileInterceptor('imageUrl', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/blog',
      filename: fileNamer
    })
  }))
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/blog/file/${file.filename}`;

    return this.blogService.create({
      ...createBlogDto,
      imageUrl: secureUrl
    });
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOnePlain(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('imageUrl', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/blog',
      filename: fileNamer
    })
  }))
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const secureUrl = `${this.configService.get('HOST_API')}/blog/file/${file.filename}`;
      updateBlogDto.imageUrl = secureUrl;
    }

    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
