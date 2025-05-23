import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdicionaisService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.adicionais.findMany();
  }

  async create(data: { nome: string; preco: string }) {
    const preco = parseFloat(data.preco); // Converte o preço de string para número
    if (isNaN(preco)) {
      throw new Error('Preço inválido');
    }

    return this.prisma.adicionais.create({
      data: {
        nome: data.nome,
        preco,
      },
    });
  }

  async update(id: number, data: { nome: string; preco: string }) {
    const preco = parseFloat(data.preco); // Converte o preço de string para número
    if (isNaN(preco)) {
      throw new Error('Preço inválido');
    }

    const adicionalExists = await this.prisma.adicionais.findUnique({
      where: { id },
    });
    if (!adicionalExists) {
      throw new NotFoundException(`Adicional com ID ${id} não encontrado`);
    }

    return this.prisma.adicionais.update({
      where: { id },
      data: {
        nome: data.nome,
        preco,
      },
    });
  }

  async delete(id: number) {
    const adicionalExists = await this.prisma.adicionais.findUnique({
      where: { id },
    });
    if (!adicionalExists) {
      throw new NotFoundException(`Adicional com ID ${id} não encontrado`);
    }

    return this.prisma.adicionais.delete({
      where: { id },
    });
  }

  async getAdicionalById(id: number) {
    try {
      return await this.prisma.adicionais.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Erro ao buscar adicional: ${error.message}`);
    }
  }
}