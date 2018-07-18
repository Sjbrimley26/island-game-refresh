import "babel-polyfill";

import "../assets/styles/ui.scss";

const R = require("rambda");

const {
  connect_socket_to_server
} = require("../assets/network/socket");

const { Repeater } = require("../assets/gameplay/emitter");

const { 
  spawn_tiles,
  reset_tiles,
  highlight_tiles,
  highlight_tiles_near_XY,
  get_all_tile_sprites,
  get_nearby_tile_sprites
 } = require("../assets/gameplay/spriteFunctions");

const { Game, CANVAS, Scene } = require("phaser");

const debounce = require('debounce');

const { createSampleUser, add_client_functions } = require("../assets/objects/Player");

const {
  get_tile_position_from_XY,
} = require("../assets/gameplay/tileFunctions");

const client = connect_socket_to_server();

const sampleUser = createSampleUser("Spencer");

const repeater = new Repeater;

const scene = new Scene('Game');

const phaserConfig = {
  type: CANVAS,
  width: 1080,
  height: 810,
  scene
};

const game = new Game(phaserConfig);

scene.preload = function () {
  this.load.image('background', '../assets/images/background.jpg');
  this.load.image('shade', '../assets/images/shade.png');
  this.load.image('tile', '../assets/images/hexagon.png');
  this.load.image('marker', '../assets/images/marker.png');
  this.load.image('tile--highlighted', '../assets/images/hexagon--highlighted.png');

};

scene.create = function () {
  this.add.sprite(400, 300, 'background');

  client.connectUser(sampleUser);

  game.hex_tiles = spawn_tiles(scene);

  game.marker = this.add.sprite(0, 0, 'marker').setName('marker');
  game.marker.setOrigin = (0, 0.5);
  game.marker.visible = false;
  game.hex_tiles.add(game.marker);

  client.game_objects.tiles = game.hex_tiles;

  const move_index = game.input.addMoveCallback(checkHex);

  client.socket.on("UPDATE_USERS", payload => {
    // console.log(`${player.name} received test_event with payload:`, payload);
    client.every_player(player => {
      // console.log(player);
      if (client.player_sprites.some(sprite => sprite.name === player.id)) {
        let sprite = R.find(sprite => sprite.name === player.id)(client.player_sprites);
        sprite.x = player.x;
        sprite.y = player.y;
      } 
      else {
        let shade = this.add.sprite(player.x, player.y, 'shade');
        shade.name = player.id;
        client.player_sprites.push(shade);
      }
    });

    client.game_objects.players = client.player_sprites;

  });

  client.socket.on("NEXT_TURN", player => {
    if (player.id === sampleUser.id) {

      const xy_coords = {
        x: player.x,
        y: player.y
      };

      const currentPlayer = add_client_functions(client.players.get(player.id))(client);
      currentPlayer.add_status_effect("stunned");
      currentPlayer.onStartTurn();

      const move_player_to_sprite = sprite => {
        try {
          const [x, y] = get_tile_position_from_XY(sprite.x, sprite.y);
          const payload = {
            player,
            x,
            y
          };

          client.socket.emit("PLAYER_MOVE", payload);
          reset_tiles(game);
          moveable_tiles.forEach(tile => tile.off("pointerdown", move_player_to_sprite));
        } catch (e) {
          // I know in my heart that this is wrong, haha.
        }
      }

      const moveable_tiles = get_nearby_tile_sprites(game)(xy_coords, 2);
      moveable_tiles.forEach(sprite => {
        sprite.on("pointerdown", move_player_to_sprite);
      });
      highlight_tiles(moveable_tiles);

      const endTurnButton = document.getElementById("endTurnButton");

      const handleEndTurn = event => {
        endTurnButton.removeEventListener("click", handleEndTurn);
        endTurnButton.classList.toggle("active");
        client.socket.emit("END_TURN");
        currentPlayer.onEndTurn();
        reset_tiles(game);
      };

      endTurnButton.addEventListener("click", handleEndTurn);
      endTurnButton.classList.toggle("active");
    }

  });

  client.socket.on("TURN_ZERO", () => {
    client.socket.emit("TURN_ZERO");

    const endTurnButton = document.getElementById("endTurnButton");
    endTurnButton.classList.remove("active");
    const cloneButton = endTurnButton.cloneNode(true);
    endTurnButton.parentNode.replaceChild(cloneButton, endTurnButton);
    reset_tiles(game);
    
  });

};

const checkHex = event => {
  const { clientX, clientY } = event;

  try {
    const [x, y] = get_tile_position_from_XY(clientX, clientY);
    place_marker(x, y);
    repeater.broadcast_mouse_movement(x, y);
  }
  catch (e) {
    /* 
      I hate doing this but I don't know how else to make
      the errors stop.
      It's just because the get_tile_position_from_XY returns undefined in certain
      spots.
    */
  }
};

const place_marker = ( x, y ) => {
  let { marker } = game;

  if (
    x < 0 ||
    y < 0 ||
    x >= 1080 ||
    y > 810
  ) {
    marker.visible = false;
  } else {
    marker.visible = true;
    marker.x = x;
    marker.y = y;
  }
}

repeater.on( "mouse_moved", debounce(payload => {
  // highlight_tiles_near_XY(game)(payload, 2);
}, 200));