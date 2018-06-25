const io = require("../../node_modules/socket.io-client");

const host = "http://localhost:3000";

const connect_socket_to_server = connection => {
  const socket = io.connect(host);

  socket.on("UPDATE_USERS", players => {
    connection.players = players;
    console.log(players);
  });

  const client = {
    socket,
    connectUser: function (user) {
      this.socket.emit('ADD_USER', user);
    }
  };

  return client;
};

module.exports = {
  connect_socket_to_server
};