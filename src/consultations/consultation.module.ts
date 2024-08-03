import { Module } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Consultation } from "./entities/consultation.entity";
import { Reply } from "./entities/reply.entity";
import { User } from "../auth/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config"; // Import ConfigModule as well

@Module({
  controllers: [ConsultationController],
  providers: [ConsultationService],
  imports: [
    TypeOrmModule.forFeature([Consultation, Reply, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule instead of AuthModule here
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ConfigModule, // Import ConfigModule here if it's not already imported in a parent module
  ]
})
export class ConsultationModule {}