import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';

export const mesaSockets = new Map(); // Maps num_mesas to socket ID

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve static assets
  app.useStaticAssets(path.join(__dirname, '..', '..', 'public', 'images_products'), {
    prefix: '/images_products',
  });
  app.useStaticAssets(path.join(__dirname, '..', '..', 'public', 'images_users'), {
    prefix: '/images_users',
  });

  // Use Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Initialize Socket.IO server
  const server = app.getHttpServer();
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  (global as any).__io = io; // Store Socket.IO instance for controller access

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}, transporte: ${socket.conn.transport.name}`);

    socket.on('registerMesa', (num_mesas) => {
      console.log(`Tablet registrado na mesa ${num_mesas} com socket ID ${socket.id}`);
      mesaSockets.set(num_mesas.toString(), socket.id);
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
      for (const [num_mesas, socketId] of mesaSockets.entries()) {
        if (socketId === socket.id) {
          console.log(`Removendo tablet da mesa ${num_mesas}`);
          mesaSockets.delete(num_mesas);
          break;
        }
      }
    });
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res: import('express').Response) => {
    console.log('Health check accessed');
    res.status(200).json({ status: 'Server running', socketIO: 'Active' });
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`Servidor rodando na porta ${PORT}`);
}
bootstrap();