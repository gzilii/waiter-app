import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { mesaSockets } from '../main';
import { Server } from 'socket.io';

@Controller('mesas')
export class MesasController {
  private io: Server;

  constructor(private readonly mesasService: MesasService) {
    process.nextTick(() => {
      this.io = (global as any).__io;
    });
  }

  private async notifyLogout(num_mesas: string) {
    const socketId = mesaSockets.get(num_mesas);
    if (socketId && this.io) {
      console.log(`Notificando logout para mesa ${num_mesas} no socket ${socketId}`);
      this.io.to(socketId).emit('logout', { message: 'Mesa deslogada pelo administrador' });
    } else {
      console.log(`Nenhum socket encontrado para a mesa ${num_mesas}`);
    }
  }

  private async broadcastMesaStatus(mesa: { id: number; num_mesas: number; info: number }) {
    if (this.io) {
      console.log(`Broadcasting mesa status update: ${JSON.stringify(mesa)}`);
      this.io.emit('mesaStatusUpdate', mesa);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.mesasService.findAll();
    } catch (error) {
      throw new HttpException('Erro ao buscar mesas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login-tablet')
    async loginTablet(@Body() body: { mesa: number }) {
      const { mesa } = body;

      if (!mesa) {
        throw new HttpException('O número da mesa é obrigatório', HttpStatus.BAD_REQUEST);
      }

      const mesaExists = await this.mesasService.validateMesa(mesa);
      if (!mesaExists) {
        throw new HttpException('Mesa inválida', HttpStatus.BAD_REQUEST);
      }

      await this.mesasService.marcarMesaComoOcupada(mesa);
      const updatedMesa = await this.mesasService.findByNumMesas(mesa);
      if (!updatedMesa) {
        throw new HttpException('Mesa não encontrada após atualização', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      await this.broadcastMesaStatus(updatedMesa);

      return { mesa };
    }

  @Post('bulk')
  async createMesas(@Body() body: { quantidade: number }) {
    const { quantidade } = body;

    if (!quantidade || quantidade <= 0) {
      throw new HttpException('Quantidade inválida', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.mesasService.createMesas(quantidade);
    } catch (error) {
      throw new HttpException('Erro ao criar mesas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('num/:num_mesas')
  async logoutMesa(@Param('num_mesas') num_mesas: string, @Body() body: { info: number }) {
    const { info } = body;

    if (info !== 0) {
      throw new HttpException('Apenas logout (info = 0) é permitido', HttpStatus.BAD_REQUEST);
    }

    try {
      const mesa = await this.mesasService.findByNumMesas(parseInt(num_mesas));
      if (!mesa) {
        throw new HttpException('Mesa não encontrada', HttpStatus.NOT_FOUND);
      }

      await this.mesasService.updateMesaInfo(parseInt(num_mesas), info);
      await this.notifyLogout(num_mesas);
      await this.broadcastMesaStatus({ id: mesa.id, num_mesas: mesa.num_mesas, info });

      return { id: mesa.id, num_mesas: mesa.num_mesas, info };
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Erro ao deslogar mesa', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateMesa(@Param('id') id: string, @Body() body: { num_mesas: number; info: number }) {
    const { num_mesas, info } = body;

    try {
      const mesa = await this.mesasService.findById(parseInt(id));
      if (!mesa) {
        throw new HttpException('Mesa não encontrada', HttpStatus.NOT_FOUND);
      }

      await this.mesasService.updateMesa(parseInt(id), num_mesas, info);
      const updatedMesa = await this.mesasService.findById(parseInt(id));
      if (!updatedMesa) {
        throw new HttpException('Mesa não encontrada após atualização', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      await this.broadcastMesaStatus(updatedMesa);
      if (info === 0) {
        await this.notifyLogout(num_mesas.toString());
      }

      return { id, num_mesas, info };
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Erro ao atualizar mesa', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteMesa(@Param('id') id: string) {
    try {
      await this.mesasService.deleteMesa(parseInt(id));
      return { message: 'Mesa excluída' };
    } catch (error) {
      throw error instanceof HttpException ? error : new HttpException('Erro ao excluir mesa', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}