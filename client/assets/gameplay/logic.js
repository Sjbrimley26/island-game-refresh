const { get_random_letter } = require("./utilities");

function roll_the_dice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

//same as above, but player's luck factors in
//player's luck should be a number between -0.5 and 0.5
//so they would be able to roll anywhere between -50 and 150 on a 100-sided dice
function lucky_roll(sides, player) {
  return Math.floor((Math.random() + player.luck) * sides) + 1;
}

const get_new_id = () => {
  let i = 0;
  let id = "";
  do {
    id += get_random_letter();
    i++;
  } while (i < 5)
  id += new Date().getMilliseconds();
  return id;
};

const add_listen = obj => {
  return {
    ...obj,
    listen: (event, emitter) => {
      return cb => {
        emitter.on(event, cb);
      };
    }
  }
};

module.exports = {
  roll_the_dice,
  lucky_roll,
  add_listen,
  get_new_id
};