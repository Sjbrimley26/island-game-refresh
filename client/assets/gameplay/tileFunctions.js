const { get_random_of_array, is_even } = require("../network/utilities");
const { range, compose, zip, flatten, curry, subtract, add } = require("rambda");

const hexagon_width = 128;
const hexagon_height = 112;
const rows = 12;
const columns = 16;

const get_XY_at_tile = (tileX, tileY) => {
  let x = hexagon_width / 4 * 3 * tileX;
  let y = hexagon_height * tileY - hexagon_height / 2;

  if (is_even(tileX)) {
    y += hexagon_height / 2;
  } else {
    y += hexagon_height;
  }

  return [ x, y ];
};

// The center positions at least
const all_tile_positions = [];
for (let i = 0; i < 12; i++) {
  for (let j = 0; j < 16; j++) {
    all_tile_positions.push(get_XY_at_tile(i, j));
  }
};

// Each area contains all the points in the tile
const all_tile_areas = all_tile_positions.map(tile => {
  let [ x, y ] = tile;
  const startX = x - hexagon_width / 4;
  const endX = x + hexagon_width / 4;
  const startY = y - hexagon_height / 2;
  const endY = y + hexagon_height / 2;

  const x_values = range(startX, endX);
  const y_values = range(startY, endY);
  
  const xy_values = [];
  
  x_values.forEach(x_value => {
    return y_values.forEach(y_value => {
      xy_values.push([x_value, y_value]);
    });
  });

  return xy_values;
});

const get_tile_index_from_XY = ( x, y ) => {
  let match;

  for (let i = 0; i < all_tile_areas.length - 1; i++) {
    for (let j = 0; j < all_tile_areas[i].length - 1; j++) {
      if (all_tile_areas[i][j][0] == x && all_tile_areas[i][j][1] == y) {
        match = i;
      }
    }
  }

  return match;
};

const get_tile_position_from_XY = ( x, y ) => {
  return all_tile_positions[get_tile_index_from_XY(x,y)];
};

const get_random_tile_XY = () => {
  return get_random_of_array(all_tile_positions);
};

const get_grid_position_from_XY = ( x, y ) => {
  let tileX, tileY;

  tileX = x / (hexagon_width / 4 * 3);

  if ( is_even(tileX) ) {
    y -= hexagon_height / 2;
  }
  else {
    y -= hexagon_height;
  }

  tileY = ( y + hexagon_height / 2 ) / hexagon_height;

  return [ tileX, tileY ];
}

const get_tile_distance = (x1, y1) => (x2, y2) => {
  x1 = get_grid_position_from_XY(x1, y1)[0];
  y1 = get_grid_position_from_XY(x1, y1)[1];
  x2 = get_grid_position_from_XY(x2, y2)[0];
  y2 = get_grid_position_from_XY(x2, y2)[1];
  const clean = compose(
    Math.ceil,
    Math.abs,
    subtract
  );
  let xDiff = clean(x2, x1);
  let yDiff = clean(y2, y1);
  return xDiff >= yDiff ? xDiff : yDiff; 
};

// Only works when tiles are one tile away for now

const get_tiles_near_tile = ( tileX, tileY, maxDistance ) => {
  let tiles = [];
  let factors = range(1, maxDistance + 1);
  
  const push_if_new = ( array, xy_pair ) => {
    if ( 
      array.some(coord => {
        xy_pair[0] == coord[0] &&
        xy_pair[1] == coord[1]
      }) 
    ) {
      return;
    }
    array.push(xy_pair);
  };

  const add_tile = curry(push_if_new)(tiles);

  factors.forEach(factor => {
    add_tile([tileX + factor, tileY]);
    add_tile([tileX - factor, tileY]);
    add_tile([tileX, tileY + factor]);
    add_tile([tileX, tileY - factor]);

    if ( is_even(tileX) ) {
      add_tile([tileX - factor, tileY - factor]);
      add_tile([tileX + factor, tileY - factor]);
    } else {
      add_tile([tileX - factor, tileY + factor]);
      add_tile([tileX + factor, tileY + factor]);
    }
  });


  return tiles.filter(tile => {
    return tile[0] >= 0 &&
      tile[0] <= rows &&
      tile[1] >= 0 &&
      tile[1] <= columns;
  });
};

const get_tile_index_from_tileXY = ( tileX, tileY ) => {
  const [ x, y ] = get_XY_at_tile(tileX,tileY);
  for ( let i = 0; i < all_tile_positions.length; i++ ) {
    if ( all_tile_positions[i][0] === x && all_tile_positions[i][1] === y ) {
      return i;
    }
  }
  return -1;
};

module.exports = {
  get_XY_at_tile,
  get_random_tile_XY,
  get_tile_position_from_XY,
  get_tile_index_from_XY,
  all_tile_positions,
  get_grid_position_from_XY,
  get_tile_distance,
  get_tiles_near_tile,
  get_tile_index_from_tileXY
};