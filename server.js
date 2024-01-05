const express = require('express')
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Porta de conexão do servidor
const PORT = 3000;
server.listen(PORT, () => console.error('listening on http://localhost:3000/'));

//caminho do arquivo html
app.get('/', (req, res) => {
  res.sendFile(path.join( __dirname, '/public', 'index.html'));
});
//Número de usuários conectados
let connectedUsers = 0;

// Chatroom - sala de bate-papo
io.on('connection', (socket) => {
  let addedUser = false;

  // Quando o client emite 'nova mensagem', isso escuta e executa
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // Quando o client emite 'adicionar usuário', isso escuta e executa
  socket.on('add user', (username) => {
    if (addedUser) return;
    // armazena o usuário na sessão socket para esse client
    socket.username = username;
    ++connectedUsers;
    addedUser = true;
    socket.emit('login', {
      connectedUsers: connectedUsers
    });
    // Ecoa globalmente (todos clients) que uma pessoa conectou
    socket.broadcast.emit('user joined', {
      username: socket.username,
      connectedUsers: connectedUsers
    });
  });

  // Quando o usuário desconectar
  socket.on('disconnect', () => {
    if (addedUser) {
      --connectedUsers;

      // ecoa globalmente que o usuário se desconectou
      socket.broadcast.emit('user left', {
        username: socket.username,
        connectedUsers: connectedUsers
      });
    }
  });
});
   

