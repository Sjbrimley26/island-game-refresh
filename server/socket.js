const R = require("rambda");

const addSocketFunctions = io => {
  io.players = {};

  const broadcast = (action, payload) => {
    return io.sockets.emit(action, payload);
  }

  const update_user_broadcast = broadcast.bind(this, "UPDATE_USERS", io.players);
  const disconnect_broadcast = broadcast.bind(this, "disconnect", io.players);

  io.on("connection", socket => {

    socket.on("ADD_USER", user => {
      // console.log(`User #${user.id} connected!`);
      io.players[user.id] = user;
      socket.user = user;
      update_user_broadcast();
    });

    socket.on("disconnect", () => {
      if (socket.user) {
        // console.log(`User #${socket.user.id} disconnected!`);
        delete io.players[socket.user.id];
        update_user_broadcast();
        disconnect_broadcast();
      }
    });

    

  });

  return io;
}

module.exports = {
  addSocketFunctions
};