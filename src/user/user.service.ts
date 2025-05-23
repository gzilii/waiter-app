import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: { nome: string; sobrenome: string; login: string; senha: string; foto: string | null }) {
    const hashedPassword = await bcrypt.hash(data.senha, 10);
    return this.prisma.user.create({
      data: {
        nome: data.nome,
        sobrenome: data.sobrenome,
        login: data.login,
        senha: hashedPassword,
        foto: data.foto,
      },
    });
  }

  async validateUser(login: string, senha: string) {
    const user = await this.prisma.user.findUnique({ where: { login } });
    if (user && await bcrypt.compare(senha, user.senha)) {
      const { senha, ...result } = user;
      return result;
    }
    return null;
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        foto: true,
        login: true,
        senha: true, // Incluindo o campo senha (hash)
      },
    });
  }

  async updateUser(id: number, data: { nome?: string; sobrenome?: string; login?: string; senha?: string; foto?: string | null }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { foto: true },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const updateData: any = {
      nome: data.nome,
      sobrenome: data.sobrenome,
      login: data.login,
      foto: data.foto, // Pode ser null para remover a foto
    };
    if (data.senha) {
      updateData.senha = await bcrypt.hash(data.senha, 10);
    }

    // Se a foto está sendo removida (null) e havia uma foto antes, deletar o arquivo
    if (data.foto === null && user.foto) {
      const filePath = path.join(__dirname, '..', 'public', user.foto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Remove o arquivo físico
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { foto: true },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Deleta o usuário do banco de dados
    await this.prisma.user.delete({
      where: { id },
    });

    // Se houver uma foto, deleta o arquivo físico
    if (user.foto) {
      const filePath = path.join(__dirname, '..', 'public', user.foto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Remove o arquivo físico
      }
    }

    return { foto: user.foto };
  }
}