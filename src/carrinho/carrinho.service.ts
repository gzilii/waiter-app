import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CarrinhoService {
  constructor(private prisma: PrismaService) {}

    async addToCart(
      id_num_mesa: number | string, // pode ser o número da mesa
      id_produto: number,
      quantity: number,
      id_adicionais: number[]
    ) {
      try {
        // Busca o ID da mesa baseado no número da mesa
        const mesa = await this.prisma.num_mesas.findFirst({
          where: {
            num_mesas: Number(id_num_mesa), // isso aqui é o número visível da mesa
          },
        });
    
        if (!mesa) {
          throw new Error('Mesa não encontrada');
        }
    
        // Cria item no carrinho com o ID correto da mesa
        const cartItem = await this.prisma.carrinho.create({
          data: {
            id_num_mesa: mesa.id, // agora sim é o ID real da mesa
            id_produto,
            info: 0,
            qnt: quantity,
            id_adicionais: id_adicionais.length > 0 ? id_adicionais : Prisma.JsonNull,
          },
          include: { produtos: true },
        });
    
        return cartItem;
      } catch (error) {
        throw new Error(`Erro ao adicionar ao carrinho: ${error.message}`);
      }
    }
  

  async getCartByMesa(id_num_mesa: number) {
    try {
      return await this.prisma.carrinho.findMany({
        where: { id_num_mesa },
        include: {
          produtos: true,
        },
      });
    } catch (error) {
      throw new Error(`Erro ao buscar carrinho: ${error.message}`);
    }
  }

  async removeFromCart(id: number) {
    try {
      await this.prisma.carrinho.delete({
        where: { id },
      });
      return { message: 'Item removido do carrinho' };
    } catch (error) {
      throw new Error(`Erro ao remover do carrinho: ${error.message}`);
    }
  }

  async updateCartItem(id: number, quantity: number) {
    try {
      const updatedItem = await this.prisma.carrinho.update({
        where: { id },
        data: { qnt: quantity },
        include: { produtos: true },
      });
      return updatedItem;
    } catch (error) {
      throw new Error(`Erro ao atualizar item no carrinho: ${error.message}`);
    }
  }
}