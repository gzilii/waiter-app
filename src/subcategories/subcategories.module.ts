import { Module } from '@nestjs/common';
import { SubCategoriesService } from './subcategories.service';
import { SubCategoriesController } from './subcategories.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService, PrismaService],
})
export class SubCategoriesModule {}