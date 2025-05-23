import { Controller, Get, Post, Put, Delete, Body, UploadedFile, UseInterceptors, Param, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('produtos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.getAllProducts();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('foto'))
  async createProduct(
    @UploadedFile() foto: Express.Multer.File,
    @Body() body: {
      nome: string;
      preco: string;
      id_sub_categoria: string;
      descricao: string;
      quantped: string;
    },
  ) {
    return this.productsService.createProduct({
      nome: body.nome,
      preco: body.preco,
      id_sub_categoria: parseInt(body.id_sub_categoria, 10),
      descricao: body.descricao,
      foto,
      quantped: parseInt(body.quantped, 10),
    });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('foto'))
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: Express.Multer.File,
    @Body() body: {
      nome: string;
      preco: string;
      id_sub_categoria?: string; // Opcional
      descricao: string;
    },
  ) {
    return this.productsService.updateProduct(id, {
      nome: body.nome,
      preco: body.preco,
      id_sub_categoria: body.id_sub_categoria ? parseInt(body.id_sub_categoria, 10) : undefined,
      descricao: body.descricao,
      foto,
    });
  }

  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.deleteProduct(id);
    return { message: 'Produto excluído com sucesso' };
  }

  // Novo endpoint para buscar os adicionais de um produto
  @Get(':id/adicionais')
  async getProductAdicionais(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductAdicionais(id);
  }

  // Novo endpoint para adicionar um adicional ao produto
  @Post(':id/adicionais')
  async addAdicional(
    @Param('id', ParseIntPipe) id: number,
    @Body('id_adicional', ParseIntPipe) id_adicional: number,
  ) {
    return this.productsService.addAdicional(id, id_adicional);
  }

  // Novo endpoint para remover um adicional do produto
  @Delete(':id/adicionais/:adicionalId')
  async removeAdicional(
    @Param('id', ParseIntPipe) id: number,
    @Param('adicionalId', ParseIntPipe) adicionalId: number,
  ) {
    await this.productsService.removeAdicional(id, adicionalId);
    return { message: 'Adicional removido com sucesso' };
  }
}