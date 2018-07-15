const { is_even } = require("../network/utilities");
const { 
  get_grid_position_from_XY,
  get_tiles_near_tile,
  get_XY_at_tile
} = require("./tileFunctions");

const R = require("rambda");

const get_all_tile_sprites = game => {
  const {
    hex_tiles
  } = game;
  return [...hex_tiles.children.entries]
    .filter(sprite => sprite.name !== 'marker');
};

const get_nearby_tile_sprites = game => (xy_obj, range) => {
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

const spawn_tiles = scene => {
  const hexagon_width = 128;
  const hexagon_height = 112;
  const grid_x = 12;
  const grid_y = 16;
  let hexagon_group;

  hexagon_group = scene.add.group();

  for (let i = 0; i < grid_x / 2; i++) {
    for (let j = 0; j < grid_y; j++) {
      if (is_even(grid_x) || i + 1 < grid_x / 2 || is_even(j)) {
        let hex_x =
          (hexagon_width * i * 1.5) +
          (hexagon_width / 4 * 3) *
          (j % 2);

        let hex_y = hexagon_height * j / 2;

        let hexagon = scene.add.sprite(hex_x, hex_y, "tile").setInteractive();
        hexagon_group.add(hexagon);
      }
    }
  }

  hexagon_group.y = (
    600 -
    hexagon_height *
    Math.ceil(grid_y / 2)
  ) / 2;

  if (is_even(grid_y)) {
    hexagon_group.y -= hexagon_height / 4;
  }

  hexagon_group.x = (
    800 -
    Math.ceil(grid_x / 2) *
    hexagon_width -
    Math.floor(grid_x / 2) *
    hexagon_width / 2
  ) / 2;

  if (is_even(grid_x)) {
    hexagon_group.x -= hexagon_width / 8;
  }

  return hexagon_group;
};

const highlight_tiles = tileArray => {
  tileArray.forEach(tile => {
    tile.setTexture('tile--highlighted');
  });

};

const highlight_tiles_near_XY = game => ( xy_obj, range ) => {
  highlight_tiles(
    get_nearby_tile_sprites(game)(xy_obj, range)
  );
};

const reset_tiles = game => {
  const tileSprites = get_all_tile_sprites(game);

  tileSprites.forEach(sprite => {
    sprite.setTexture('tile');
    sprite.removeAllListeners("pointerdown");
  });
};

module.exports = {
  spawn_tiles,
  get_all_tile_sprites,
  reset_tiles,
  get_nearby_tile_sprites,
  highlight_tiles,
  highlight_tiles_near_XY
};