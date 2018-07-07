const EventEmitter = require("events");
const { 
  get_tile_index_from_XY, 
  all_tile_positions ,
  get_grid_position_from_XY,
  get_tile_distance
} = require("./tileFunctions");

class Repeater extends EventEmitter {
  constructor(props) {
    super(props);
    this.previousPosition = undefined;

    this.broadcast_mouse_movement = (x, y) => {
      if (
        this.previousPosition &&
        this.previousPosition[0] === x &&
        this.previousPosition[1] === y
      ) {
        return;
      } else {
        if (this.previousPosition) {
          /*
          console.log(get_tile_distance(
            this.previousPosition[0],
            this.previousPosition[1]
          )(x, y));
          */
        }

        this.previousPosition = [ x, y ];
        this.emit("mouse_moved", { x, y });
      }
    };

  }

};

module.exports = {
  Repeater
};