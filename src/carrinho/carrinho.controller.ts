import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { CarrinhoService } from './carrinho.service';

@Controller('carrinho')
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  @Post('add')
  async addToCart(@Body() data: { id_num_mesa: number; id_produto: number; quantity: number; id_adicionais: number[] }) {
    return this.carrinhoService.addToCart(data.id_num_mesa, data.id_produto, data.quantity, data.id_adicionais);
  }

  @Get('mesa/:id_num_mesa')
  async getCartByMesa(@Param('id_num_mesa') id_num_mesa: string) {
    return this.carrinhoService.getCartByMesa(Number(id_num_mesa)); // Converte aqui também
  }

  @Put(':id')
  async updateCartItem(@Param('id') id: string, @Body() data: { quantity: number }) {
    return this.carrinhoService.updateCartItem(Number(id), data.quantity);
  }

  @Delete(':id')
  async removeFromCart(@Param('id') id: string) {
    return this.carrinhoService.removeFromCart(Number(id));
  }
}