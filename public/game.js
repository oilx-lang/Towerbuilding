// Game state
let socket;
let canvas, ctx;
let camera = { x: 0, y: 10, z: 20, rotationX: 0, rotationY: 0 };
let isDragging = false;
let lastMouseX = 0, lastMouseY = 0;
let blocks = [];
let players = new Map();
let myPlayerId = null;
let myPlayerColor = '#ff6b6b';

// Initialize the game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize WebSocket connection
    initSocket();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start game loop
    gameLoop();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

function initSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
        document.getElementById('loading-screen').style.display = 'none';
        showNotification('Connected to game!', 'success');
    });
    
    socket.on('gameState', (state) => {
        blocks = state.tower || [];
        players = new Map(state.players.map(p => [p.id, p]));
        updatePlayerCount();
        updateTowerHeight();
    });
    
    socket.on('blockPlaced', (block) => {
        blocks.push(block);
        updateTowerHeight();
        showNotification(`${getPlayerName(block.playerId)} placed a block!`, 'info');
    });
    
    socket.on('playerJoined', (player) => {
        players.set(player.id, player);
        updatePlayerCount();
        updatePlayersList();
        showNotification(`${player.name} joined the game!`, 'success');
    });
    
    socket.on('playerLeft', (playerId) => {
        const player = players.get(playerId);
        if (player) {
            showNotification(`${player.name} left the game`, 'info');
            players.delete(playerId);
            updatePlayerCount();
            updatePlayersList();
        }
    });
    
    socket.on('playerNameChanged', (data) => {
        const player = players.get(data.id);
        if (player) {
            player.name = data.name;
            updatePlayersList();
        }
    });
    
    socket.on('maxHeightUpdated', (height) => {
        updateTowerHeight();
    });
    
    socket.on('towerReset', () => {
        blocks = [];
        updateTowerHeight();
        showNotification('Tower has been reset!', 'warning');
    });
}

function setupEventListeners() {
    // Mouse controls
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onMouseWheel);
    canvas.addEventListener('click', onCanvasClick);
    
    // Player name input
    const nameInput = document.getElementById('player-name');
    nameInput.addEventListener('change', (e) => {
        socket.emit('changeName', e.target.value);
    });
    
    // Block color picker
    const colorInput = document.getElementById('block-color');
    colorInput.addEventListener('change', (e) => {
        myPlayerColor = e.target.value;
    });
    
    // Chat functionality
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-chat');
    
    sendButton.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function onMouseDown(e) {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
}

function onMouseMove(e) {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        camera.rotationY += deltaX * 0.01;
        camera.rotationX += deltaY * 0.01;
        
        // Clamp rotation
        camera.rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotationX));
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
}

function onMouseUp() {
    isDragging = false;
}

function onMouseWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? 1 : -1;
    
    // Zoom in/out
    camera.z += delta * zoomSpeed * Math.abs(camera.z);
    camera.z = Math.max(5, Math.min(50, camera.z));
}

function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const worldPos = screenToWorld(x, y);
    
    if (worldPos) {
        // Place block at the clicked position
        const blockData = {
            x: Math.round(worldPos.x),
            y: Math.round(worldPos.y),
            z: Math.round(worldPos.z),
            color: myPlayerColor
        };
        
        socket.emit('placeBlock', blockData);
    }
}

function screenToWorld(screenX, screenY) {
    // Simple ray casting for block placement
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Convert screen coordinates to normalized device coordinates
    const ndcX = (screenX - centerX) / centerX;
    const ndcY = (screenY - centerY) / centerY;
    
    // Simple ground plane intersection
    const groundY = 0;
    const rayOrigin = { x: camera.x, y: camera.y, z: camera.z };
    const rayDir = { x: ndcX, y: ndcY, z: -1 };
    
    // Normalize ray direction
    const length = Math.sqrt(rayDir.x * rayDir.x + rayDir.y * rayDir.y + rayDir.z * rayDir.z);
    rayDir.x /= length;
    rayDir.y /= length;
    rayDir.z /= length;
    
    // Find intersection with ground plane
    if (rayDir.y !== 0) {
        const t = (groundY - rayOrigin.y) / rayDir.y;
        if (t > 0) {
            return {
                x: rayOrigin.x + rayDir.x * t,
                y: groundY,
                z: rayOrigin.z + rayDir.z * t
            };
        }
    }
    
    return null;
}

function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (message) {
        addChatMessage('You', message);
        chatInput.value = '';
    }
}

function addChatMessage(playerName, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerHTML = `<span class="player-name">${playerName}:</span> ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updatePlayerCount() {
    document.getElementById('player-count').textContent = players.size;
}

function updateTowerHeight() {
    const maxHeight = blocks.length > 0 ? Math.max(...blocks.map(b => b.y)) : 0;
    document.getElementById('tower-height').textContent = maxHeight;
}

function updatePlayersList() {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.innerHTML = `
            <div class="player-color" style="background-color: ${player.color}"></div>
            <span class="player-name">${player.name}</span>
        `;
        playersList.appendChild(playerDiv);
    });
}

function getPlayerName(playerId) {
    const player = players.get(playerId);
    return player ? player.name : 'Unknown Player';
}

function showNotification(message, type = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notifications.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 3D rendering functions
function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    drawGround();
    
    // Sort blocks by distance for proper depth rendering
    const sortedBlocks = [...blocks].sort((a, b) => {
        const distA = getDistanceToCamera(a);
        const distB = getDistanceToCamera(b);
        return distB - distA; // Draw farthest first
    });
    
    // Draw blocks
    sortedBlocks.forEach(block => {
        drawBlock(block);
    });
    
    // Draw players
    players.forEach(player => {
        if (player.position) {
            drawPlayer(player);
        }
    });
}

function drawGround() {
    const groundY = canvas.height * 0.8;
    ctx.fillStyle = '#8FBC8F'; // Dark sea green
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Draw grid
    ctx.strokeStyle = '#7A9A7A';
    ctx.lineWidth = 1;
    const gridSize = 50;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = groundY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawBlock(block) {
    const screenPos = worldToScreen(block.x, block.y, block.z);
    if (screenPos) {
        const size = 20;
        const alpha = Math.max(0.3, 1 - getDistanceToCamera(block) / 100);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw block shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(screenPos.x - size/2 + 2, screenPos.y - size/2 + 2, size, size);
        
        // Draw block
        ctx.fillStyle = block.color;
        ctx.fillRect(screenPos.x - size/2, screenPos.y - size/2, size, size);
        
        // Draw block border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenPos.x - size/2, screenPos.y - size/2, size, size);
        
        ctx.restore();
    }
}

function drawPlayer(player) {
    const screenPos = worldToScreen(player.position.x, player.position.y, player.position.z);
    if (screenPos) {
        const size = 15;
        
        // Draw player shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(screenPos.x + 2, screenPos.y + 2, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw player name
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, screenPos.x, screenPos.y - size/2 - 5);
    }
}

function worldToScreen(worldX, worldY, worldZ) {
    // Simple 3D to 2D projection
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Apply camera rotation
    const cosY = Math.cos(camera.rotationY);
    const sinY = Math.sin(camera.rotationY);
    const cosX = Math.cos(camera.rotationX);
    const sinX = Math.sin(camera.rotationX);
    
    // Transform world coordinates
    let x = worldX - camera.x;
    let y = worldY - camera.y;
    let z = worldZ - camera.z;
    
    // Apply Y rotation
    const tempX = x;
    x = x * cosY - z * sinY;
    z = tempX * sinY + z * cosY;
    
    // Apply X rotation
    const tempY = y;
    y = y * cosX - z * sinX;
    z = tempY * sinX + z * cosX;
    
    // Perspective projection
    if (z > 0) {
        const scale = 200 / z;
        const screenX = centerX + x * scale;
        const screenY = centerY + y * scale;
        
        return { x: screenX, y: screenY };
    }
    
    return null;
}

function getDistanceToCamera(obj) {
    const dx = obj.x - camera.x;
    const dy = obj.y - camera.y;
    const dz = obj.z - camera.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Initialize the game when the page loads
window.addEventListener('load', init); 