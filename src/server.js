import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import DocumentSocket from './sockets/DocumentSocket.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  new DocumentSocket().register(io, socket);
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 SyncForge running on port ${process.env.PORT}`);
});