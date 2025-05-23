import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async getAllDevices() {
    return this.prisma.num_mesas.findMany({
      orderBy: {
        num_mesas: 'asc', // Ordena por num_mesas em ordem crescente
      },
    });
  }

  async createDevice(num_mesas: number, info?: number) {
    try {
      return await this.prisma.num_mesas.create({
        data: {
          num_mesas,
          info: info || 0, // Define 0 como padrão se info não for fornecido
        },
      });
    } catch (error) {
      throw new HttpException('Erro ao criar dispositivo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDevice(id: number, num_mesas: number, info?: number) {
    try {
      const deviceExists = await this.prisma.num_mesas.findUnique({ where: { id } });
      if (!deviceExists) {
        throw new HttpException('Dispositivo não encontrado', HttpStatus.NOT_FOUND);
      }
      return await this.prisma.num_mesas.update({
        where: { id },
        data: {
          num_mesas,
          info: info !== undefined ? info : deviceExists.info, // Mantém o valor atual se não fornecido
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao atualizar dispositivo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDevice(id: number) {
    try {
      const deviceExists = await this.prisma.num_mesas.findUnique({ where: { id } });
      if (!deviceExists) {
        throw new HttpException('Dispositivo não encontrado', HttpStatus.NOT_FOUND);
      }
      return await this.prisma.num_mesas.delete({ where: { id } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao excluir dispositivo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createBulk(quantidade: number) {
    try {
      // Buscar todas as mesas existentes
      const mesasExistentes = await this.prisma.num_mesas.findMany({
        select: { num_mesas: true },
        orderBy: { num_mesas: 'asc' },
      });
      const numerosMesas = mesasExistentes.map((mesa) => mesa.num_mesas);
      console.log('Mesas existentes:', numerosMesas);

      // Encontrar o maior número de mesa
      const maiorNumero = numerosMesas.length > 0 ? Math.max(...numerosMesas) : 0;
      console.log('Maior número de mesa:', maiorNumero);

      // Identificar lacunas (números ausentes de 1 até maiorNumero)
      const lacunas: number[] = [];
      for (let i = 1; i <= maiorNumero; i++) {
        if (!numerosMesas.includes(i)) {
          lacunas.push(i);
        }
      }
      console.log('Lacunas encontradas:', lacunas);

      // Determinar os números das novas mesas
      const novosNumeros: number[] = [];
      let quantidadeRestante = quantidade;

      // Preencher lacunas primeiro
      for (const lacuna of lacunas) {
        if (quantidadeRestante > 0) {
          novosNumeros.push(lacuna);
          quantidadeRestante--;
        } else {
          break;
        }
      }

      // Adicionar números sequenciais após o maior número, se necessário
      let proximoNumero = maiorNumero + 1;
      while (quantidadeRestante > 0) {
        novosNumeros.push(proximoNumero);
        proximoNumero++;
        quantidadeRestante--;
      }
      console.log('Novos números de mesas:', novosNumeros);

      // Criar as novas mesas no banco de dados
      const novasMesas = await this.prisma.$transaction(
        novosNumeros.map((num) =>
          this.prisma.num_mesas.create({
            data: {
              num_mesas: num,
              info: 0,
            },
          })
        )
      );

      console.log('Mesas criadas:', novasMesas);
      return novasMesas;
    } catch (error) {
      console.error('Erro ao criar mesas:', error);
      throw new HttpException(
        error.message || 'Erro ao criar mesas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}