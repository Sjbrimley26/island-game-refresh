function roll_the_dice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

//same as above, but player's luck factors in
//player's luck should be a number between -0.5 and 0.5
//so they would be able to roll anywhere between -50 and 150 on a 100-sided dice
function lucky_roll(sides, player) {
  return Math.floor((Math.random() + player.luck) * sides) + 1;
}

const get_random_int = max => Math.floor(Math.random() * Math.floor(max));

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

const get_random_letter = () => {
  return String.fromCharCode(
    Math.random() <= 0.5 ?
    get_random_number(65, 91) :
    get_random_number(97, 123)
  );
};

/**
 * Returns a random integer between min and max (max excluded)
 * @param {int} min - The minimum possible returned value
 * @param {int} max - The maxium return value is this - 1
 */
const get_random_number = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
};

/**
 * Returns a random integer between min and max (both included)
 * @param {int} min - The minimum possible returned value
 * @param {int} max - The maxium return value
 * @param {int} multiple - The "step" value; value returned will be a 
 *  multiple of this param's value
 */
const get_random_of_multiple = (min, max, multiple) => {
  let possibilites = [];
  for (let i = min; i <= max; i) {
    if (i % multiple === 0) {
      possibilites.push(i);
      i += multiple;
    } else {
      if (multiple - i > 0) {
        i = multiple;
      } else {
        i = (Math.floor(i / multiple) + 1) * multiple;
      }
    }
  }
  return possibilites[get_random_number(0, possibilites.length)];
};

const is_even = int => {
  return int % 2 === 0;
};

const get_random_of_array = array => {
  return array[get_random_number(0, array.length)];
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

const pushUnique = (arr, item) => {
  if (arr.some(thing => thing == item)) {
    return;
  }
  arr.push(item);
};

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
const shuffle_array = a => {
  let j, x, i;
  let b = [...a];
  for (i = b.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = b[i];
    b[i] = b[j];
    b[j] = x;
  }
  return b;
};


module.exports = {
  roll_the_dice,
  lucky_roll,
  get_random_int,
  get_new_id,
  get_random_letter,
  get_random_number,
  get_random_of_array,
  get_random_of_multiple,
  shuffle_array,
  pushUnique,
  add_listen,
  is_even
};