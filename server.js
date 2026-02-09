const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let players = {};

io.on('connection', (socket) => {
    players[socket.id] = { id: socket.id };

    socket.on('move', (data) => {
        socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
    });

    // RELAY AUDIO: Receive chunk from speaker and send to everyone else
    socket.on('audio_chunk', (chunk) => {
        socket.broadcast.emit('audio_stream', { id: socket.id, chunk: chunk });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server is live on port ' + PORT);
});
