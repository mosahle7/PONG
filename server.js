const http = require('http');
const io = require('socket.io');

const apiServer = require('./api');
const httpServer = http.createServer(apiServer);
const socketServer = io(httpServer, {
    cors: {
        origin: '*',
        methods: ["GET","POST"]
    }
});

const sockets = require('./sockets');


const  PORT = 3000;

httpServer.listen(PORT);
console.log(`Listening on port ${PORT}...`);

sockets.listen(socketServer);

// let readyPlayerCount = 0;

// io.on('connection', (socket) => {
//     console.log('User has connected', socket.id);

//     socket.on('ready', () => {
//         console.log('Player ready', socket.id);
//         readyPlayerCount++;

//         if(readyPlayerCount%2 === 0){
//             io.emit('startGame', socket.id);
//         }
//     })

//     socket.on('paddleMove', (paddleData) => {
//         socket.broadcast.emit('paddleMove', paddleData);
//     })

//     socket.on('ballMove', (ballData) => {
//         socket.broadcast.emit('ballMove', ballData)
//     });

//     socket.on('disconnect', (reason) => {
//         console.log(`Client ${socket.id} disconnected: ${reason}`)
//       })
// })