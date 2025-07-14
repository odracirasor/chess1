const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

let players = {};
let gameStarted = false;

io.on('connection', (socket) => {
    console.log(`🟢 ${socket.id} connected`);

    if (Object.keys(players).length < 2) {
        players[socket.id] = Object.keys(players).length === 0 ? 'white' : 'black';
        socket.emit('playerColor', players[socket.id]);
        console.log(`🎮 Assigned ${players[socket.id]} to ${socket.id}`);
    }

    if (Object.keys(players).length === 2 && !gameStarted) {
        io.emit('startGame');
        gameStarted = true;
    }

    socket.on('move', (data) => {
        socket.broadcast.emit('move', data);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 ${socket.id} disconnected`);
        delete players[socket.id];
        gameStarted = false;
        io.emit('playerLeft');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));