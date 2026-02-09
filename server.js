const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// This tells the server to show the files in the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

let players = {};

io.on('connection', (socket) => {
    // When a new player joins
    players[socket.id] = { x: 0, y: 0, z: 0, id: socket.id };
    
    // Broadcast movement data to everyone
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].z = data.z;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Clean up when someone leaves
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server is live on port ' + PORT);
});
