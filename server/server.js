import express from 'express';
import http from 'http';
import cors from 'cors';
import "dotenv/config";
import { connectDB } from './lib/db.js';
import userRouter from './routes/user.route.js';
import messageRouter from './routes/message.route.js';
import { Server } from 'socket.io';

//Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Intialize Socket.io server
export const io = new Server(server, {
  cors: { origin: "*" }
});

// Store online users
export const userSocketMap = {}; // {userId: socketId}

// Socket.io connection handler
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('User connected', userId);

  // Handle user online event
  if(userId) userSocketMap[userId] = socket.id;

  // Emit online users to all connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));
  // socket.on('user-online', (userId) => {
  //   userSocketMap[userId] = socket.id;
  //   io.emit('online-users', Object.keys(userSocketMap));
  // });

  // Handle user offline event
  socket.on('disconnect', () => {
    console.log('User disconnected', userId);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    // Remove user from userSocketMap

  });
}
);

//Middleware setup
app.use(express.json({ limit: '5mb' }));
app.use(cors());

app.use('/api/status', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
