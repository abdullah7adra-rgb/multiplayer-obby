const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.use(express.static(__dirname)); 

let players = {};

io.on('connection', (socket) => {
    socket.on('checkUsername', (name) => {
        const isTaken = Object.values(players).some(p => p.name === name);
        socket.emit('usernameResult', { success: !isTaken, name: name });
    });

    socket.on('join', (data) => {
        players[socket.id] = { name: data.name, x: 0, y: 0, z: 0 };
        io.emit('currentPlayers', players);
    });

    socket.on('move', (data) => {
        if(players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].z = data.z;
            socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
        }
    });

    socket.on('chatMessage', (msg) => {
        if (players[socket.id]) io.emit('newMessage', { name: players[socket.id].name, text: msg });
    });

    socket.on('voiceData', (data) => {
        socket.broadcast.emit('voiceStream', { id: socket.id, buffer: data });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

http.listen(process.env.PORT || 3000);
