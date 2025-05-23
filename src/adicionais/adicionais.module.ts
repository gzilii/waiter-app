import { Module } from '@nestjs/common';
import { AdicionaisService } from './adicionais.service';
import { AdicionaisController } from './adicionais.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AdicionaisController],
  providers: [AdicionaisService, PrismaService],
})
export class AdicionaisModule {}