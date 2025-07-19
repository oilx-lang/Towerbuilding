const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static('public'));

// Game state
let gameState = {
  tower: [],
  players: new Map(),
  maxHeight: 0
};

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Tower Builder Game is running!' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // Generate random player color
  const playerColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  
  // Add player to game state
  gameState.players.set(socket.id, {
    id: socket.id,
    color: playerColor,
    name: `Player ${socket.id.slice(0, 4)}`
  });
  
  // Send current game state to new player
  socket.emit('gameState', {
    tower: gameState.tower,
    players: Array.from(gameState.players.values()),
    maxHeight: gameState.maxHeight
  });
  
  // Notify other players about new player
  socket.broadcast.emit('playerJoined', {
    id: socket.id,
    color: playerColor,
    name: `Player ${socket.id.slice(0, 4)}`
  });
  
  // Handle block placement
  socket.on('placeBlock', (blockData) => {
    const { x, y, z, color } = blockData;
    
    // Add block to tower
    const block = {
      x, y, z, color,
      playerId: socket.id,
      timestamp: Date.now()
    };
    
    gameState.tower.push(block);
    
    // Update max height
    if (y > gameState.maxHeight) {
      gameState.maxHeight = y;
    }
    
    // Broadcast block placement to all players
    io.emit('blockPlaced', block);
    io.emit('maxHeightUpdated', gameState.maxHeight);
    
    console.log(`Block placed at (${x}, ${y}, ${z}) by ${socket.id}`);
  });
  
  // Handle player movement
  socket.on('playerMove', (position) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.position = position;
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        position: position
      });
    }
  });
  
  // Handle player name change
  socket.on('changeName', (name) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.name = name;
      io.emit('playerNameChanged', {
        id: socket.id,
        name: name
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    gameState.players.delete(socket.id);
    io.emit('playerLeft', socket.id);
  });
});

// Reset tower endpoint (for admin)
app.post('/reset', (req, res) => {
  gameState.tower = [];
  gameState.maxHeight = 0;
  io.emit('towerReset');
  res.json({ message: 'Tower reset successfully' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Tower Builder Game server running on port ${PORT}`);
  console.log(`Server is ready to accept connections!`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 