import "babel-polyfill";

import "../assets/styles/ui.scss";

const R = require("rambda");

const {
  connect_socket_to_server
} = require("../assets/network/socket");

const { Repeater } = require("../assets/gameplay/emitter");

const { Game, CANVAS, Scene } = require("phaser");

const debounce = require('debounce');

const { 
  get_new_id, 
  get_random_number, 
  get_random_of_multiple,
  is_even,
  add_listen,
  get_random_of_array,
  shuffle_array,
  pushUnique
 } = require("../assets/network/utilities");

const {
  get_XY_at_tile,
  get_random_tile_XY,
  get_tile_position_from_XY,
  get_tile_distance,
  get_tiles_near_tile,
  get_grid_position_from_XY,
  get_tile_index_from_tileXY
} = require("../assets/gameplay/tileFunctions");

const client = connect_socket_to_server();

const createSampleUser = () => {
  let [ x, y ] = [0, 0];
  while (
    x == 0 ||
    y == 0 ||
    x > 1080 ||
    y > 810
  ) {
    [x, y] = get_random_tile_XY();
  }

  return {
    name: "Spencer",
    id: get_new_id(),
    x,
    y,
    initiative: 0
  };
};

const sampleUser = createSampleUser();

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

  game.hex_tiles = spawn_tiles();

  game.marker = this.add.sprite(0, 0, 'marker').setName('marker');
  game.marker.setOrigin = (0, 0.5);
  game.marker.visible = false;
  game.hex_tiles.add(game.marker);

  client.game_objects.tiles = game.hex_tiles;

  const move_index = game.input.addMoveCallback(checkHex);

  client.socket.on("UPDATE_USERS", payload => {
    console.log(payload);
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
      console.log("It's your turn!");

      const xy_coords = {
        x: player.x,
        y: player.y
      };

      highlight_tiles(xy_coords, 2);

      const emit_player_movement = sprite => {
        try {
          const [x, y] = get_tile_position_from_XY(sprite.x, sprite.y);
          const payload = {
            player,
            x,
            y
          };

          client.socket.emit("PLAYER_MOVE", payload);
          reset_tiles();
          moveable_tiles.forEach(tile => tile.off("pointerdown", emit_player_movement));
        }
        catch (e) {
          // I know in my heart that this is wrong, haha.
        }
      };

      const moveable_tiles = get_nearby_tile_sprites(xy_coords, 2);
      moveable_tiles.forEach(sprite => {
        sprite.on("pointerdown", emit_player_movement);
      })

      const endTurnButton = document.getElementById("endTurnButton");

      const handleEndTurn = event => {
        endTurnButton.removeEventListener("click", handleEndTurn);
        client.socket.emit("END_TURN");
        reset_tiles();
      };

      endTurnButton.addEventListener("click", handleEndTurn);
    }

  });

};

const spawn_tiles = () => {
  const hexagon_width = 128;
  const hexagon_height = 112;
  const grid_x = 12;
  const grid_y = 16;
  let hexagon_group;

  hexagon_group = scene.add.group();

  for (let i = 0; i < grid_x / 2; i++) {
    for (let j = 0; j < grid_y; j++) {
      if ( is_even(grid_x) || i+1 < grid_x/2 ||  is_even(j) ) {
        let hex_x = 
          (hexagon_width * i * 1.5) + 
          (hexagon_width / 4 * 3) * 
          (j % 2);

        let hex_y = hexagon_height * j/2;

        let hexagon = scene.add.sprite(hex_x, hex_y, "tile").setInteractive();
        hexagon_group.add(hexagon);
      }
    }
  }

  hexagon_group.y = (
    600 - 
    hexagon_height * 
    Math.ceil(grid_y/2)
  ) / 2;

  if ( is_even(grid_y) ) {
    hexagon_group.y -= hexagon_height/4;
  }

  hexagon_group.x = (
    800 - 
    Math.ceil(grid_x/2) * 
    hexagon_width -
    Math.floor(grid_x/2) *
    hexagon_width/2
  ) / 2;

  if ( is_even(grid_x) ) {
    hexagon_group.x -= hexagon_width/8;
  }

  return hexagon_group;
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

const get_nearby_tile_sprites = ( xy_obj, range ) => {
  const {
    hex_tiles
  } = game;
  const [tileX, tileY] = get_grid_position_from_XY(xy_obj.x, xy_obj.y);
  const nearbyTiles =
    get_tiles_near_tile(tileX, tileY, range)
    .map(tile => get_XY_at_tile(tile[0], tile[1]));

  const tileSprites = [...hex_tiles.children.entries]
    .filter(sprite => sprite.name !== 'marker');

  const nearbySprites = tileSprites.filter(sprite => {
    return nearbyTiles.some(tile => {
      return tile[0] == sprite.x &&
        tile[1] == sprite.y;
    });
  });

  return nearbySprites;
};

const highlight_tiles = ( xy_obj, range ) => {
  const nearbySprites = get_nearby_tile_sprites(xy_obj, range);

  nearbySprites.forEach(tile => {
    tile.setTexture('tile--highlighted');
  });

};

const get_all_tile_sprites = () => {
  const {
    hex_tiles
  } = game;
  return [...hex_tiles.children.entries]
    .filter(sprite => sprite.name !== 'marker');
};

const reset_tiles = () => {
  const tileSprites = get_all_tile_sprites();

  tileSprites.forEach(sprite => {
    sprite.setTexture('tile');
  });
};

repeater.on( "mouse_moved", debounce(payload => {
  // highlight_tiles(payload, 3);
}, 50));