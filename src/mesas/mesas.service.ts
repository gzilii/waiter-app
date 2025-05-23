import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.num_mesas.findMany({
      select: {
        id: true,
        num_mesas: true,
        info: true,
      },
    });
  }

  async validateMesa(num_mesas: number) {
    const mesaExists = await this.prisma.num_mesas.findFirst({
      where: { num_mesas },
    });
    return !!mesaExists;
  }

  async marcarMesaComoOcupada(num_mesas: number): Promise<void> {
    const mesa = await this.prisma.num_mesas.findFirst({
      where: { num_mesas },
    });
    if (!mesa) {
      throw new HttpException('Mesa não encontrada', HttpStatus.NOT_FOUND);
    }
    if (mesa.info === 1) {
      throw new HttpException('Mesa já está ocupada', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.num_mesas.update({
      where: { id: mesa.id },
      data: { info: 1 },
    });
  }

  async createMesas(quantidade: number) {
    const lastMesa = await this.prisma.num_mesas.findFirst({
      orderBy: { num_mesas: 'desc' },
    });
    const lastNumMesas = lastMesa ? lastMesa.num_mesas : 0;

    const mesas = await this.prisma.$transaction(
      Array.from({ length: quantidade }, (_, i) =>
        this.prisma.num_mesas.create({
          data: {
            num_mesas: lastNumMesas + i + 1,
            info: 0,
          },
        })
      )
    );

    return mesas;
  }

  async findByNumMesas(num_mesas: number) {
    return this.prisma.num_mesas.findFirst({
      where: { num_mesas },
      select: {
        id: true,
        num_mesas: true,
        info: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.num_mesas.findUnique({
      where: { id },
      select: {
        id: true,
        num_mesas: true,
        info: true,
      },
    });
  }

  async updateMesaInfo(num_mesas: number, info: number) {
    const mesa = await this.prisma.num_mesas.findFirst({
      where: { num_mesas },
    });
    if (!mesa) {
      throw new HttpException('Mesa não encontrada', HttpStatus.NOT_FOUND);
    }
    await this.prisma.num_mesas.update({
      where: { id: mesa.id },
      data: { info },
    });
  }

  async updateMesa(id: number, num_mesas: number, info: number) {
    const mesa = await this.prisma.num_mesas.findUnique({
      where: { id },
    });
    if (!mesa) {
      throw new HttpException('Mesa não encontrada', HttpStatus.NOT_FOUND);
    }
    const existingMesa = await this.prisma.num_mesas.findFirst({
      where: { num_mesas, NOT: { id } },
    });
    if (existingMesa) {
      throw new HttpException('Número da mesa já existe', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.num_mesas.update({
      where: { id },
      data: { num_mesas, info },
    });
  }

  async deleteMesa(id: number) {
    const mesa = await this.prisma.num_mesas.findUnique({
      where: { id },
    });
    if (!mesa) {
      throw new HttpException('Mesa não encontrada', HttpStatus.NOT_FOUND);
    }
    await this.prisma.num_mesas.delete({
      where: { id },
    });
  }
}