import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubCategoriesService {
  constructor(private prisma: PrismaService) {}

  async getAllSubCategories() {
    return this.prisma.sub_categoria.findMany();
  }

  async getSubCategoriesByCategory(id_categoria: number) {
    if (!id_categoria || isNaN(id_categoria)) {
      throw new HttpException('O parâmetro id_categoria deve ser um número válido', HttpStatus.BAD_REQUEST);
    }
    return this.prisma.sub_categoria.findMany({
      where: { id_categoria },
    });
  }

  async createSubCategory(nome: string, id_categoria: number, icon?: string) {
    try {
      console.log('Criando subcategoria com:', { nome, id_categoria, icon }); // Log para depuração
      const categoryExists = await this.prisma.categoria.findUnique({ where: { id: id_categoria } });
      if (!categoryExists) {
        throw new HttpException('Categoria não encontrada', HttpStatus.NOT_FOUND);
      }
      return await this.prisma.sub_categoria.create({
        data: { nome, id_categoria, icon }, // Adiciona o campo icon
      });
    } catch (error) {
      console.error('Erro no service:', error); // Log detalhado
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao criar subcategoria', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateSubCategory(id: number, nome: string, id_categoria: number, icon?: string) {
    try {
      const subCategoryExists = await this.prisma.sub_categoria.findUnique({ where: { id } });
      if (!subCategoryExists) {
        throw new HttpException('Subcategoria não encontrada', HttpStatus.NOT_FOUND);
      }
      const categoryExists = await this.prisma.categoria.findUnique({ where: { id: id_categoria } });
      if (!categoryExists) {
        throw new HttpException('Categoria não encontrada', HttpStatus.NOT_FOUND);
      }
      return await this.prisma.sub_categoria.update({
        where: { id },
        data: { nome, id_categoria, icon }, // Adiciona o campo icon
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao atualizar subcategoria', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteSubCategory(id: number) {
    try {
      const subCategoryExists = await this.prisma.sub_categoria.findUnique({ where: { id } });
      if (!subCategoryExists) {
        throw new HttpException('Subcategoria não encontrada', HttpStatus.NOT_FOUND);
      }
      return await this.prisma.sub_categoria.delete({ where: { id } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao excluir subcategoria', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}