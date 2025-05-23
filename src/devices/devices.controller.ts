import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { exec } from 'child_process';

@Controller('mesas') // Usei "mesas" como endpoint, mas pode ajustar para "devices" se preferir
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async getAllDevices() {
    return this.devicesService.getAllDevices();
  }

  @Post()
  async createDevice(@Body() body: { num_mesas: number; info?: number }) {
    if (!body.num_mesas || isNaN(body.num_mesas)) {
      throw new HttpException('O campo "num_mesas" é obrigatório e deve ser um número', HttpStatus.BAD_REQUEST);
    }
    return this.devicesService.createDevice(body.num_mesas, body.info);
  }a

  @Post('bulk')
  async createBulk(@Body() body: { quantidade: number }) {
    const { quantidade } = body;

    if (!quantidade || quantidade <= 0) {
      throw new HttpException('A quantidade deve ser um número maior que 0', HttpStatus.BAD_REQUEST);
    }

    try {
      const novasMesas = await this.devicesService.createBulk(quantidade);
      return novasMesas;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao criar mesas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async updateDevice(@Param('id') id: string, @Body() body: { num_mesas: number; info?: number }) {
    const deviceId = parseInt(id, 10);
    if (isNaN(deviceId)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }
    if (!body.num_mesas || isNaN(body.num_mesas)) {
      throw new HttpException('O campo "num_mesas" é obrigatório e deve ser um número', HttpStatus.BAD_REQUEST);
    }
    return this.devicesService.updateDevice(deviceId, body.num_mesas, body.info);
  }

  @Delete(':id')
  async deleteDevice(@Param('id') id: string) {
    const deviceId = parseInt(id, 10);
    if (isNaN(deviceId)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }
    return this.devicesService.deleteDevice(deviceId);
  }
}