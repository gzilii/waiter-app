import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoriesModule } from './subcategories/subcategories.module';
import { AdicionaisModule } from './adicionais/adicionais.module';
import { DevicesModule } from './devices/devices.module';
import { MesasModule } from './mesas/mesas.module';
import { CarrinhoModule } from './carrinho/carrinho.module';
import { Servermesas } from './servermesas/mesas.controller';

@Module({
  imports: [
    UserModule, AuthModule, ProductsModule, CategoriesModule, SubCategoriesModule, AdicionaisModule, DevicesModule, MesasModule, CarrinhoModule],
  controllers: [AppController, Servermesas],
  providers: [AppService, PrismaService],
})
export class AppModule { }