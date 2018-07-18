const io = require("../../node_modules/socket.io-client");

const host = "http://localhost:3000";

const connect_socket_to_server = () => {
  const socket = io.connect(host);

  socket.on("UPDATE_USERS", players => {
    players = new Map(players);
    client.players = players;
  });

  socket.on("disconnect", () => {
    const currentPlayers = client.player_sprites.filter(sprite => {
      return client.players.has(sprite.name);
    });

    client.player_sprites.filter(sprite => !currentPlayers.includes(sprite))
      .forEach(sprite => sprite.destroy());

    client.player_sprites = currentPlayers;
    client.game_objects.players = currentPlayers;

  });

  socket.on("NEXT_TURN", player => {
    // console.log(`${player.id}'s turn!`);
  });

  const client = {
    socket,
    connectUser: function (user) {
      console.log(user);
      this.socket.emit('ADD_USER', user);
    },
    players: new Map(),
    every_player: function ( cb ) {
      this.players.forEach(player => cb(player))
    },
    listener: {},
    player_sprites: [],
    game_objects: {}
  };

  return client;
};

module.exports = {
  connect_socket_to_server
};