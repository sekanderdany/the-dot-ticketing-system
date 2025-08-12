import { Module } from '@nestjs/common';
import { ApplicationsController, TeamsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationsController, TeamsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
