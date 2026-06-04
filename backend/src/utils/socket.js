let io;

exports.init = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
  io.on('connection', (socket) => {
    // clients should join rooms for their userId
    socket.on('join', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });
  return io;
};

exports.get = () => io;
