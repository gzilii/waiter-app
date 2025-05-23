// src/mesas/mesas.module.ts
import { Module } from '@nestjs/common';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MesasController],
  providers: [MesasService, PrismaService],
})
export class MesasModule {}