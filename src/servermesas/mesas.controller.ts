import { Controller, Put, Param, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { mesaSockets } from '../main'; // Import shared mesaSockets
import { Server } from 'socket.io';

@Controller('mesas')
export class Servermesas {
  private io: Server; // Will be initialized in main.ts

  constructor() {
    // Access the Socket.IO instance (set in main.ts after bootstrap)
    process.nextTick(() => {
      this.io = (global as any).__io; // Set in main.ts
    });
  }

  private notifyLogout(mesaId: string) {
    const socketId = mesaSockets.get(mesaId);
    if (socketId && this.io) {
      console.log(`Notificando logout para mesa ${mesaId} no socket ${socketId}`);
      this.io.to(socketId).emit('logout', { message: 'Mesa deslogada pelo administrador' });
    } else {
      console.log(`Nenhum socket encontrado para a mesa ${mesaId}`);
    }
  }

  @Put(':id')
  async updateMesa(
    @Param('id') id: string,
    @Body() body: { num_mesas: number; info: number },
    @Res() res: Response,
  ) {
    const { num_mesas, info } = body;
    console.log(`Atualizando mesa ${id} com num_mesas: ${num_mesas}, info: ${info}`);

    try {
      // Replace with your database logic (e.g., Sequelize)
      // Example:
      // const mesa = await Mesa.findByPk(id);
      // if (!mesa) {
      //   return res.status(HttpStatus.NOT_FOUND).json({ message: 'Mesa não encontrada' });
      // }
      // await mesa.update({ num_mesas, info });

      if (info === 0) {
        this.notifyLogout(id); // Trigger WebSocket logout
      }

      res.status(HttpStatus.OK).json({ id, num_mesas, info });
    } catch (error) {
      console.error('Erro ao atualizar mesa:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erro ao atualizar mesa' });
    }
  }
}