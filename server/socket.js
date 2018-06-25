const R = require("rambda");

const addSocketFunctions = io => {
  io.players = {};

  const broadcast = (action, payload) => {
    return io.sockets.emit(action, payload);
  }

  const update_user_broadcast = broadcast.bind(this, "UPDATE_USERS", io.players);

  io.on("connection", socket => {
    // console.log("Connected!");

    socket.on("ADD_USER", user => {
      // console.log(`User #${user.id} connected!`);
      io.players[user.id] = user;
      socket.user = user;
      update_user_broadcast();
    });

    socket.on("disconnect", () => {
      // console.log(`User #${socket.user.id} disconnected!`);
      if (socket.user) {
        io.players = R.dissoc(socket.user.id, io.players);
        update_user_broadcast();
      }
    });

  });

  return io;
}

module.exports = {
  addSocketFunctions
};