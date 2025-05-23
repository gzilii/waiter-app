// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { login: string; senha: string }) {
    const user = await this.authService.validateUser(body.login, body.senha);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    return this.authService.login(user);
  }
}