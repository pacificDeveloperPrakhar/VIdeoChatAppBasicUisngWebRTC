// signaling server

const http = require('http');
const express = require('express');
const { Server: SocketIO } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, { cors: true ,path:"/signaling"});

const PORT = process.env.PORT || 8000;

app.use(express.static('./public'));

io.on('connection', socket => {
    console.log(`${socket.id} has been connected`)
    socket.emit('me', socket.id);

    socket.on('action/offer', data => {
        const { offer, to } = data;
        io.to(to).emit('incomming/offer', { offer, from: socket.id });
    });

    socket.on('action/answer', data => {
        const { answer, to } = data;
        io.to(to).emit('incomming/answer', { answer, from: socket.id });
    });
    socket.on("disconnect",()=>{
        console.log(`${socket.id} has been disconnected`)
    })
});

server.listen(PORT, () => console.log(`🚀 Server started at PORT${PORT}`));
