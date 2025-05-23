import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getAllProducts() {
    return this.prisma.produtos.findMany();
  }

  async getProductById(id: number) {
    const produto = await this.prisma.produtos.findUnique({
      where: { id },
    });
    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    return produto;
  }

  async createProduct(data: {
    nome: string;
    preco: string;
    id_sub_categoria: number;
    descricao: string;
    foto: Express.Multer.File;
    quantped: number;
  }) {
    const { foto, ...productData } = data;

    // Salvar a imagem no diretório public/images_products na raiz
    const uploadDir = path.join(__dirname, '..', '..', '..', 'public', 'images_products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${foto.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, foto.buffer);

    // Caminho relativo para armazenar no banco
    const dbFilePath = `/images_products/${fileName}`;

    // Criar o produto no banco
    return this.prisma.produtos.create({
      data: {
        ...productData,
        id_sub_categoria: parseInt(String(productData.id_sub_categoria), 10),
        quantped: parseInt(String(productData.quantped), 10),
        foto: dbFilePath,
      },
    });
  }

  async updateProduct(
    id: number,
    data: {
      nome: string;
      preco: string;
      id_sub_categoria?: number;
      descricao: string;
      foto?: Express.Multer.File;
    },
  ) {
    // Busca o produto atual
    const product = await this.prisma.produtos.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Preparar os dados para atualização
    const updatedData: any = {
      nome: data.nome,
      preco: data.preco,
      descricao: data.descricao,
      id_sub_categoria: data.id_sub_categoria ?? product.id_sub_categoria, // Mantém o valor atual se não enviado
    };

    // Se uma nova imagem for enviada, substituir a antiga
    if (data.foto) {
      const oldImagePath = path.join(__dirname, '..', '..', '..', 'public', product.foto);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Remove a imagem antiga
      }

      const uploadDir = path.join(__dirname, '..', '..', '..', 'public', 'images_products');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${data.foto.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, data.foto.buffer);
      updatedData.foto = `/images_products/${fileName}`;
    }

    // Atualizar o produto no banco
    return this.prisma.produtos.update({
      where: { id },
      data: updatedData,
    });
  }

  async deleteProduct(id: number) {
    // Busca o produto para obter o caminho da imagem
    const product = await this.prisma.produtos.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Remove a imagem da pasta public/images_products
    const imagePath = path.join(__dirname, '..', '..', '..', 'public', product.foto);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Exclui o arquivo
    }

    // Exclui o produto do banco de dados
    return this.prisma.produtos.delete({
      where: { id },
    });
  }

  // Novo método para buscar os adicionais de um produto
  async getProductAdicionais(productId: number) {
    const adicionais = await this.prisma.prod_adicionais.findMany({
      where: { id_produto: productId },
      include: { adicionais: true },
    });
    return adicionais.map((item) => item.adicionais);
  }

  // Novo método para adicionar um adicional ao produto
  async addAdicional(productId: number, adicionalId: number) {
    // Verifica se o produto e o adicional existem
    const product = await this.prisma.produtos.findUnique({ where: { id: productId } });
    const adicional = await this.prisma.adicionais.findUnique({ where: { id: adicionalId } });

    if (!product) throw new NotFoundException('Produto não encontrado');
    if (!adicional) throw new NotFoundException('Adicional não encontrado');

    // Cria o vínculo na tabela prod_adicionais
    return this.prisma.prod_adicionais.create({
      data: {
        id_produto: productId,
        id_adicional: adicionalId,
      },
    });
  }

  // Novo método para remover um adicional do produto
  async removeAdicional(productId: number, adicionalId: number) {
    // Verifica se o vínculo existe
    const existing = await this.prisma.prod_adicionais.findFirst({
      where: {
        id_produto: productId,
        id_adicional: adicionalId,
      },
    });

    if (!existing) throw new NotFoundException('Vínculo entre produto e adicional não encontrado');

    // Remove o vínculo da tabela prod_adicionais
    return this.prisma.prod_adicionais.deleteMany({
      where: {
        id_produto: productId,
        id_adicional: adicionalId,
      },
    });
  }
}