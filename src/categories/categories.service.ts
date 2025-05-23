import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    return this.prisma.categoria.findMany();
  }

  async createCategory(nome: string, icon: string) {
    try {
      return await this.prisma.categoria.create({
        data: { 
          nome,
          icon, // Adiciona o campo icon ao criar a categoria
        },
      });
    } catch (error) {
      throw new HttpException('Erro ao criar categoria', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCategory(id: number, nome: string, icon?: string) { // icon é opcional na atualização
    try {
      const categoryExists = await this.prisma.categoria.findUnique({ where: { id } });
      if (!categoryExists) {
        throw new HttpException('Categoria não encontrada', HttpStatus.NOT_FOUND);
      }
      return await this.prisma.categoria.update({
        where: { id },
        data: { 
          nome,
          ...(icon && { icon }), // Atualiza o icon apenas se fornecido
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao atualizar categoria', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCategory(id: number) {
    try {
      const categoryExists = await this.prisma.categoria.findUnique({ where: { id } });
      if (!categoryExists) {
        throw new HttpException('Categoria não encontrada', HttpStatus.NOT_FOUND);
      }
      // Verifica se há subcategorias associadas
      const subCategories = await this.prisma.sub_categoria.findMany({ where: { id_categoria: id } });
      if (subCategories.length > 0) {
        // Opcional: remover subcategorias associadas ou impedir exclusão
        await this.prisma.sub_categoria.deleteMany({ where: { id_categoria: id } });
      }
      return await this.prisma.categoria.delete({ where: { id } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao excluir categoria', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}