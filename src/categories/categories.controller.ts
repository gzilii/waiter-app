import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categorias')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Post()
  async createCategory(@Body() body: { nome: string; icon: string }) {
    if (!body.nome) {
      throw new HttpException('O campo "nome" é obrigatório', HttpStatus.BAD_REQUEST);
    }
    if (!body.icon) {
      throw new HttpException('O campo "icon" é obrigatório', HttpStatus.BAD_REQUEST);
    }
    return this.categoriesService.createCategory(body.nome, body.icon);
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() body: { nome: string; icon?: string }) {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }
    if (!body.nome) {
      throw new HttpException('O campo "nome" é obrigatório', HttpStatus.BAD_REQUEST);
    }
    return this.categoriesService.updateCategory(categoryId, body.nome, body.icon);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }
    return this.categoriesService.deleteCategory(categoryId);
  }
}