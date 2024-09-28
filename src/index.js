const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const whatsappClient = require('./services/WhatsappClient');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the static HTML file
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Pass the `io` instance to the WhatsApp client
whatsappClient.initialize(io);

server.listen(3000, () => console.log('Server is ready'));
