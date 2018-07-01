import "babel-polyfill";

const R = require("rambda");
const {
  connect_socket_to_server
} = require("../assets/network/socket");

const { Game, AUTO, Scene } = require("phaser");
const { 
  get_new_id, 
  get_random_number, 
  get_random_of_multiple,
  is_even,
  get_random_of_array
 } = require("../assets/network/utilities");

const {
  get_XY_at_tile,
  get_random_tile_XY
} = require("../assets/gameplay/tileFunctions");

const client = connect_socket_to_server();

const createSampleUser = () => {
  let [ x, y ] = [0, 0];
  while (
    x == 0 ||
    y == 0 ||
    x > 800 ||
    y > 600
  ) {
    [x, y] = get_random_tile_XY();
  }

  return {
    name: "Spencer",
    id: get_new_id(),
    x,
    y
  };
};

const sampleUser = createSampleUser();

const my_player = R.find(sprite => sprite.name === sampleUser.id);

const scene = new Scene('Game');

const phaserConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  scene
};

const game = new Game(phaserConfig);

scene.preload = function () {
  this.load.image('background', '../assets/images/background.jpg');
  this.load.image('shade', '../assets/images/shade.png');
  this.load.image('tile', '../assets/images/hexagon.png');
  this.load.image('marker', '../assets/images/marker.png');

  setInterval(() => {
    // console.log(get_random_number(0, 6));
    // console.log(get_random_of_multiple(0, 100, 7));
  }, 500);

};

scene.create = function () {
  this.add.sprite(400, 300, 'background');

  client.connectUser(sampleUser);

  game.hex_tiles = spawn_tiles();
  let move_index;

  game.marker = this.add.sprite(0, 0, 'marker');
  game.marker.setOrigin = (0, 0.5);
  game.marker.visible = false;
  game.hex_tiles.add(game.marker);
  move_index = game.input.addMoveCallback(checkHex);
  
  all_tile_positions.forEach(tile => {
    const [ x, y ] = tile;
    let newMarker = this.add.sprite(x, y, 'marker');
    newMarker.setOrigin = (0.5, 0.5);
  })

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

  });

};

const spawn_tiles = () => {
  const hexagon_width = 128;
  const hexagon_height = 112;
  const grid_x = 10;
  const grid_y = 12;
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

        let hexagon = scene.add.sprite(hex_x, hex_y, "tile");
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

  if ( is_even(grid_x)) {
    hexagon_group.x -= hexagon_width/8;
  }

  return hexagon_group;
};

const checkHex = () => {
  const { hex_tiles } = game;
  const hexagon_width = 128;
  const hexagon_height = 112;
  const sector_width = hexagon_width / 4 * 3;
  const sector_height = hexagon_height;
  const gradient = ( (hexagon_width/4) / (hexagon_height/2) );
  let candidate_x = Math.floor( (game.input.activePointer.worldX - hex_tiles.x) / sector_width );
  let candidate_y = Math.floor( (game.input.activePointer.worldY - hex_tiles.y) / sector_height);
  const dX = (game.input.activePointer.worldX - hex_tiles.x) % sector_width;
  const dY = (game.input.activePointer.worldY - hex_tiles.y) % sector_height;
  
  if ( is_even(candidate_x) ) {
    if ( dX < ((hexagon_width / 4) - dY * gradient) ) {
      candidate_x--;
      candidate_y--;
    }
    if ( dX < ((hexagon_width / 4) + dY * gradient) ) {
      candidate_x--;
    }
  }
  else {
    if ( dY >= hexagon_height/2 ) {
      if ( dX < (hexagon_height/2 - dY * gradient) ) {
        candidate_x--;
      }
    }
    else {
      if ( dX < dY * gradient ) {
        candidate_x--;
      }
      else {
        candidate_y--;
      }
    }
  }

  place_marker(candidate_x, candidate_y);

};

const place_marker = ( x, y ) => {
  let { marker } = game;
  const grid_y = 12;
  const hexagon_width = 128;
  const hexagon_height = 112;
  const columns = [ Math.floor(grid_y/2), Math.ceil(grid_y/2) ];

  if ( 
    x < 0 ||
    y < 0 ||
    x >= 10 ||
    y > columns[x%2] - 1
  ) 
  {
    marker.visible = false;
  }
  else {
    marker.visible = true;
    marker.x = hexagon_width/4*3 * x;
    marker.y = hexagon_height * y - hexagon_height/2;

    if ( is_even(x) ) {
      marker.y += hexagon_height/2;
    }
    else {
      marker.y += hexagon_height;
    }
  }

};