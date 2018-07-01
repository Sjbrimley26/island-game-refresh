const io = require("../../node_modules/socket.io-client");

const host = "http://localhost:3000";

const connect_socket_to_server = () => {
  const socket = io.connect(host);

  socket.on("UPDATE_USERS", players => {
    client.players = players;
  });

  socket.on("disconnect", () => {
    const currentPlayers = client.player_sprites.filter(sprite => {
      return Object.keys(client.players)
        .some(player => player === sprite.name);
    });

    client.player_sprites.filter(sprite => !currentPlayers.includes(sprite))
      .forEach(sprite => sprite.destroy());

    client.player_sprites = currentPlayers;

  });

  const client = {
    socket,
    connectUser: function (user) {
      this.socket.emit('ADD_USER', user);
    },
    players: {},
    every_player: function ( cb ) {
      Object.keys(this.players)
        .forEach(player => cb(this.players[player]))
    },
    listener: {},
    player_sprites: []
  };

  return client;
};

module.exports = {
  connect_socket_to_server
};