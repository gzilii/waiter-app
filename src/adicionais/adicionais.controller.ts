import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { AdicionaisService } from './adicionais.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('adicionais')
export class AdicionaisController {
  constructor(private readonly adicionaisService: AdicionaisService) {}

  @Get()
  async findAll() {
    return this.adicionaisService.findAll();
  }

  @Get(':id') // Novo endpoint pra buscar por ID
  async findOne(@Param('id') id: string) {
    const adicional = await this.adicionaisService.getAdicionalById(Number(id));
    if (!adicional) {
      throw new NotFoundException(`Adicional com ID ${id} não encontrado`);
    }
    return adicional;
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() data: { nome: string; preco: string }) {
    return this.adicionaisService.create(data);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(@Param('id') id: string, @Body() data: { nome: string; preco: string }) {
    return this.adicionaisService.update(Number(id), data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.adicionaisService.delete(Number(id));
  }
}