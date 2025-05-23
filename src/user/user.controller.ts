import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';

@Controller('usuarios')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(FileInterceptor('foto', {
    storage: diskStorage({
      destination: './public/images_users',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    }),
  }))
  async createUser(@Body() data: any, @UploadedFile() file: Express.Multer.File) {
    const fotoPath = file ? `/images_users/${file.filename}` : null;
    return this.userService.createUser({ ...data, foto: fotoPath });
  }

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('foto', {
    storage: diskStorage({
      destination: './public/images_users',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    }),
  }))
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() data: any, @UploadedFile() file: Express.Multer.File) {
    const fotoPath = file ? `/images_users/${file.filename}` : data.foto === '' ? null : undefined;
    return this.userService.updateUser(id, { ...data, foto: fotoPath });
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.userService.deleteUser(id);
    return { message: 'Usuário excluído com sucesso' };
  }
}