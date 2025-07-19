# 🏗️ Tower Builder - Multiplayer Web Game

A real-time multiplayer web game where players collaboratively build a tower together! Players can see each other building in real-time, chat, and work together to create amazing structures.

## ✨ Features

- **Real-time Multiplayer**: See other players building blocks simultaneously
- **3D Tower Building**: Click to place blocks in a 3D environment
- **Interactive Camera**: Drag to rotate view, scroll to zoom in/out
- **Player Customization**: Choose your name and block color
- **Live Chat**: Communicate with other players
- **Player List**: See who's online and their colors
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern, clean interface with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   # If you have git installed
   git clone <repository-url>
   cd tower-builder-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

5. **Start building!**
   - Click anywhere on the ground to place blocks
   - Drag to rotate the camera view
   - Scroll to zoom in/out
   - Change your name and block color in the sidebar
   - Chat with other players

## 🎮 How to Play

### Controls
- **🖱️ Left Click**: Place a block at the clicked location
- **🖱️ Drag**: Rotate the camera view around the tower
- **🔄 Mouse Wheel**: Zoom in and out
- **⌨️ Chat**: Type messages in the chat panel

### Building Tips
- Start with a solid foundation at ground level
- Work together with other players to build higher
- Use different colors to create patterns
- Coordinate with chat to plan your tower design

### Multiplayer Features
- **Real-time Updates**: See blocks appear instantly when other players place them
- **Player Colors**: Each player gets a unique color for their blocks
- **Live Chat**: Communicate with other builders
- **Player List**: See who's currently online

## 🛠️ Technical Details

### Architecture
- **Backend**: Node.js with Express and Socket.IO
- **Frontend**: Vanilla JavaScript with HTML5 Canvas
- **Real-time Communication**: WebSocket connections via Socket.IO
- **3D Rendering**: Custom 3D to 2D projection system

### File Structure
```
tower-builder-game/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html     # Main HTML file
│   ├── style.css      # Styling
│   └── game.js        # Client-side game logic
└── README.md          # This file
```

### Key Components

#### Server (`server.js`)
- Handles WebSocket connections
- Manages game state (blocks, players)
- Broadcasts updates to all connected players
- Provides REST endpoints for game management

#### Client (`public/game.js`)
- 3D rendering engine
- Mouse and keyboard input handling
- Real-time multiplayer synchronization
- UI updates and notifications

#### Styling (`public/style.css`)
- Modern, responsive design
- Glassmorphism effects
- Smooth animations
- Mobile-friendly layout

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon to automatically restart the server when files change.

### Adding New Features
1. **Server-side**: Add new Socket.IO events in `server.js`
2. **Client-side**: Handle new events in `public/game.js`
3. **UI**: Update HTML and CSS as needed

### Customization Options
- **Block Colors**: Players can choose any color for their blocks
- **Player Names**: Customizable player names
- **Camera Controls**: Adjustable sensitivity and zoom limits
- **Game Rules**: Modify building constraints or add new features

## 🌐 Deployment

### Local Network
To allow other players on your network to join:
1. Find your computer's IP address
2. Share the IP address with other players
3. They can connect via `http://YOUR_IP:3000`

### Cloud Deployment
The game can be deployed to platforms like:
- **Heroku**: Use the provided `package.json`
- **Vercel**: Deploy as a Node.js application
- **Railway**: Simple deployment with automatic scaling
- **DigitalOcean**: Deploy to a droplet

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## 🤝 Contributing

Feel free to contribute to this project! Some ideas for improvements:
- Add different block types (wood, stone, glass)
- Implement gravity and physics
- Add sound effects
- Create different game modes
- Add leaderboards and achievements
- Implement save/load functionality

## 📝 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

- **Block Types**: Different materials with unique properties
- **Physics Engine**: Realistic gravity and block interactions
- **Sound Effects**: Building sounds and ambient audio
- **Achievements**: Unlockable milestones and badges
- **Tower Templates**: Pre-designed structures to build
- **Mobile Support**: Touch controls for mobile devices
- **Spectator Mode**: Watch without building
- **Tournament Mode**: Competitive building challenges

---

**Have fun building together! 🏗️✨** 