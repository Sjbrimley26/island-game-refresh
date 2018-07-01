const { get_random_of_array } = require("../network/utilities");

const get_XY_at_tile = (tileX, tileY) => {
  const hexagon_width = 128;
  const hexagon_height = 112;
  let x, y;

  x = hexagon_width / 4 * 3 * tileX;
  y = hexagon_height * tileY - hexagon_height / 2;

  if (is_even(tileX)) {
    y += hexagon_height / 2;
  } else {
    y += hexagon_height;
  }

  return [x, y];
};

const all_tile_positions = [];
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 12; j++) {
    all_tile_positions.push(get_XY_at_tile(i, j));
  }
};

const get_random_tile_XY = () => {
  return get_random_of_array(all_tile_positions);
};

module.exports = {
  get_XY_at_tile,
  get_random_tile_XY
};