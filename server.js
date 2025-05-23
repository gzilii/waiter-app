const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Explicitly allow both transports
});

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check accessed');
  res.status(200).json({ status: 'Server running', socketIO: 'Active' });
});

// Socket.IO endpoint for debugging
app.get('/socket.io/', (req, res) => {
  console.log('Socket.IO endpoint accessed');
  res.status(200).send('Socket.IO endpoint');
});

const mesaSockets = new Map();

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('registerMesa', (mesaId) => {
    console.log(`Tablet registrado na mesa ${mesaId} com socket ID ${socket.id}`);
    mesaSockets.set(mesaId, socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
    for (const [mesaId, socketId] of mesaSockets.entries()) {
      if (socketId === socket.id) {
        console.log(`Removendo tablet da mesa ${mesaId}`);
        mesaSockets.delete(mesaId);
        break;
      }
    }
  });
});

const notifyLogout = (mesaId) => {
  const socketId = mesaSockets.get(mesaId);
  if (socketId) {
    console.log(`Notificando logout para mesa ${mesaId} no socket ${socketId}`);
    io.to(socketId).emit('logout', { message: 'Mesa deslogada pelo administrador' });
  } else {
    console.log(`Nenhum socket encontrado para a mesa ${mesaId}`);
  }
};

app.put('/mesas/:id', async (req, res) => {
  const mesaId = req.params.id;
  const { num_mesas, info } = req.body;

  try {
    console.log(`Atualizando mesa ${mesaId} com num_mesas: ${num_mesas}, info: ${info}`);
    // Substitua pela sua lógica de atualização no banco de dados
    // Exemplo com Sequelize:
    // const mesa = await Mesa.findByPk(mesaId);
    // if (!mesa) {
    //   return res.status(404).json({ message: 'Mesa não encontrada' });
    // }
    // await mesa.update({ num_mesas, info });

    if (info === 0) {
      notifyLogout(mesaId);
    }

    res.json({ id: mesaId, num_mesas, info });
  } catch (error) {
    console.error('Erro ao atualizar mesa:', error);
    res.status(500).json({ message: 'Erro ao atualizar mesa' });
  }
});

app.get('/mesas', async (req, res) => {
  // Substitua pela sua lógica de busca
  res.json([]);
});

app.post('/mesas/bulk', async (req, res) => {
  // Substitua pela sua lógica
  res.json([]);
});

app.delete('/mesas/:id', async (req, res) => {
  // Substitua pela sua lógica
  res.json({ message: 'Mesa excluída' });
});

app.get('/produtos', async (req, res) => {
  // Substitua pela sua lógica
  res.json([]);
});

app.get('/sub_categorias', async (req, res) => {
  // Substitua pela sua lógica
  res.json([]);
});

app.get('/carrinho/mesa/:mesa', async (req, res) => {
  // Substitua pela sua lógica
  res.json([]);
});

app.post('/carrinho/add', async (req, res) => {
  // Substitua pela sua lógica
  res.json({ id: 1 });
});

app.put('/carrinho/:id', async (req, res) => {
  // Substitua pela sua lógica
  res.json({ id: req.params.id });
});

app.delete('/carrinho/:id', async (req, res) => {
  // Substitua pela sua lógica
  res.json({ message: 'Item removido' });
});

app.get('/produtos/:id/adicionais', async (req, res) => {
  // Substitua pela sua lógica
  res.json([]);
});

app.get('/adicionais/:id', async (req, res) => {
  // Substitua pela sua lógica
  res.json({ id: req.params.id, nome: 'Adicional', preco: 5.00 });
});

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});