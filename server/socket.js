const addSocketFunctions = io => {
  io.players = {};

  io.on("connection", socket => {
    // console.log("Connected!");

    socket.on("ADD_USER", user => {
      io.players[user.id] = user;
      socket.user = user;
      io.sockets.emit("UPDATE_USERS", io.players);
    });

    socket.on("disconnect", () => {
      // console.log(`User #${socket.user.id} disconnected!`);
      delete io.players[socket.user.id];
      io.sockets.emit("UPDATE_USERS", io.players);
    })

  });

  return io;
}

module.exports = {
  addSocketFunctions
};