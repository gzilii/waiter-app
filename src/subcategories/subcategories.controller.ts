import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SubCategoriesService } from './subcategories.service';

@Controller('sub_categorias')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Get()
  async getSubCategories(@Query('id_categoria') id_categoria?: string) {
    if (id_categoria) {
      const categoryId = parseInt(id_categoria, 10);
      if (isNaN(categoryId)) {
        throw new HttpException('id_categoria inválido', HttpStatus.BAD_REQUEST);
      }
      return this.subCategoriesService.getSubCategoriesByCategory(categoryId);
    }
    return this.subCategoriesService.getAllSubCategories();
  }

  @Post()
  async createSubCategory(@Body() body: { nome: string; id_categoria: number; icon?: string }) {
    if (!body.nome || body.id_categoria === undefined) {
      throw new HttpException('Os campos "nome" e "id_categoria" são obrigatórios', HttpStatus.BAD_REQUEST);
    }
    if (isNaN(body.id_categoria)) {
      throw new HttpException('id_categoria deve ser um número válido', HttpStatus.BAD_REQUEST);
    }
    return this.subCategoriesService.createSubCategory(body.nome, body.id_categoria, body.icon);
  }

  @Put(':id')
  async updateSubCategory(@Param('id') id: string, @Body() body: { nome: string; id_categoria: number; icon?: string }) {
    const subCategoryId = parseInt(id, 10);
    if (isNaN(subCategoryId)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }
    if (!body.nome || body.id_categoria === undefined) {
      throw new HttpException('Os campos "nome" e "id_categoria" são obrigatórios', HttpStatus.BAD_REQUEST);
    }
    if (isNaN(body.id_categoria)) {
      throw new HttpException('id_categoria deve ser um número válido', HttpStatus.BAD_REQUEST);
    }
    return this.subCategoriesService.updateSubCategory(subCategoryId, body.nome, body.id_categoria, body.icon);
  }

  @Delete(':id')
  async deleteSubCategory(@Param('id') id: string) {
    const subCategoryId = parseInt(id, 10);
    if (isNaN(subCategoryId)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }
    return this.subCategoriesService.deleteSubCategory(subCategoryId);
  }
}