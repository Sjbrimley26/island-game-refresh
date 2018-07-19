const io = require("../../node_modules/socket.io-client");

const { reset_tiles } = require("../gameplay/spriteFunctions");

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
    console.log(client.players);
  });

  socket.on("UPDATE_ITEMS", player => {
    let currentPlayer = client.players.get(player.id);
    currentPlayer.inventory = player.inventory;
  });

  const client = {
    socket,
    players: new Map(),
    listener: {},
    player_sprites: [],
    game_objects: {},

    connectUser: function (user) {
      this.socket.emit('ADD_USER', user);
    },

    every_player: function (cb) {
      this.players.forEach(player => cb(player))
    },

    prepEndTurn (player) {
      const endTurnButton = document.getElementById("endTurnButton");

      const handleEndTurn = event => {
        endTurnButton.removeEventListener("click", handleEndTurn);
        endTurnButton.classList.toggle("active");
        client.socket.emit("END_TURN");
        player.onEndTurn();
      };

      endTurnButton.addEventListener("click", handleEndTurn);
      endTurnButton.classList.toggle("active");

    }

  };

  return client;
};

module.exports = {
  connect_socket_to_server
};