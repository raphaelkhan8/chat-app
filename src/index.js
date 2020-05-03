const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationUrl } = require('../src/utils/messages');
const { addUser, removeUser, getUserInfo, getAllUsersInRoom } = require('./utils/users');
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Welcome', 'Admin'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the chat!`, 'Admin'));
        io.to(room).emit('roomUpdate', {
            room: user.room,
            users: getAllUsersInRoom(user.room)
        });
        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        // check for profane language before emitting message
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Unable to post. Profane language is not allowed! D:');
        }
        const { username, room } = getUserInfo(socket.id);
        io.to(room).emit('message', generateMessage(message, username));
        callback();
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const { username, room } = getUserInfo(socket.id);
        io.to(room).emit('locationMessage', generateLocationUrl(latitude, longitude, username));
        callback();
    })

    socket.on('disconnect', () => {
        const removedUser = removeUser(socket.id);
        if (removedUser) {
            const { room, username } = removedUser;
            io.to(room).emit('message', generateMessage(`${username} has left the chat :('`, 'Admin'));
            io.to(room).emit('roomUpdate', {
                room: room,
                users: getAllUsersInRoom(room)
            });
        }
    })

})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));