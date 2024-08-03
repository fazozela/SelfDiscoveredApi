import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog, BlogImage } from "./entities";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { join } from "path";
import { existsSync } from "fs";
import { unlink } from 'fs/promises';

@Injectable()
export class BlogService {
  private readonly logger = new Logger('BlogService');

  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,

    @InjectRepository(BlogImage)
    private blogImageRepository: Repository<BlogImage>,

    private readonly dataSource: DataSource
  ) { }

  async create(createBlogDto: CreateBlogDto) {
    const { imageUrl, ...blogDetails } = createBlogDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const blog = this.blogRepository.create(blogDetails);

      if (imageUrl) {
        const blogImage = this.blogImageRepository.create({ url: imageUrl });
        await queryRunner.manager.save(blogImage);
        blog.imageUrl = blogImage;
      }

      await queryRunner.manager.save(blog);

      await queryRunner.commitTransaction();
      return { ...blog, imageUrl: imageUrl };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const blogs = await this.blogRepository.find({
      relations: ['imageUrl']
    });

    return blogs.map(blog => {
      const { imageUrl, ...rest } = blog;
      return {
        ...rest,
        imageUrl: imageUrl?.url || ''
      };
    });
  }

  findOne(id: string) {
    const blog = this.blogRepository.findOneBy({id});
    return blog;
  }

  async findOnePlain(id: string) {
    const blog = await this.findOne(id);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    const { imageUrl, ...rest } = blog;

    return {
      ...rest,
      imageUrl: imageUrl?.url || ''
    };
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const { imageUrl, ...toUpdate } = updateBlogDto;
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['imageUrl']
    });

    if (!blog) throw new NotFoundException(`Blog with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update blog fields
      Object.assign(blog, toUpdate);

      if (imageUrl) {
        if (blog.imageUrl) {
          // Update existing image
          blog.imageUrl.url = imageUrl;
          await queryRunner.manager.save(blog.imageUrl);
        } else {
          // Create new image
          const newImage = this.blogImageRepository.create({ url: imageUrl });
          await queryRunner.manager.save(newImage);
          blog.imageUrl = newImage;
        }

        // Delete old image file if it exists
        if (blog.imageUrl && blog.imageUrl.url !== imageUrl) {
          await this.deleteImageFile(blog.imageUrl.url);
        }
      }

      await queryRunner.manager.save(blog);
      await queryRunner.commitTransaction();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    await this.blogRepository.delete(id);
  }

  getStaticProductImage(imageName: string){
    const path = join(__dirname, '../../static/blog', imageName);
    if (!existsSync(path)) throw new BadRequestException(`No product found with name ${imageName}`);
    return path;
  }

  private async deleteImageFile(imageUrl: string) {
    try {
      const fileName = imageUrl.split('/').pop();
      const filePath = join(__dirname, '../../static/blog', fileName);
      await unlink(filePath);
    } catch (error) {
      this.logger.error(`Failed to delete image file: ${error.message}`);
      // We don't throw here to allow the process to continue even if file deletion fails
    }
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error);
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

}
