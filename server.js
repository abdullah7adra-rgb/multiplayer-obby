const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    socket.on('move', (data) => {
        socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
    });

    // Audio relay
    socket.on('audio_data', (data) => {
        socket.broadcast.emit('audio_stream', data);
    });

    socket.on('disconnect', () => {
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server is live on port ' + PORT);
});
