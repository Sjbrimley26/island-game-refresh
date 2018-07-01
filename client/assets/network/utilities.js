/**
 * Returns a random integer between min and max (max excluded)
 * @param {int} min - The minimum possible returned value
 * @param {int} max - The maxium return value is this - 1
 */
const get_random_number = ( min, max ) => {
  return Math.floor(Math.random() * (max - min) + min)
};

const get_random_letter = () => {
  return String.fromCharCode(
    Math.random() <= 0.5 ?
      get_random_number(65, 91) :
      get_random_number(97, 123)
  );
};

/**
 * Returns a random integer between min and max (both included)
 * @param {int} min - The minimum possible returned value
 * @param {int} max - The maxium return value
 * @param {int} multiple - The "step" value; value returned will be a 
 *  multiple of this param's value
 */
const get_random_of_multiple = ( min, max, multiple ) => {
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

const is_even = int => {
  return int % 2 === 0;
};

const get_random_of_array = array => {
  return array[get_random_number(0, array.length)];
};

module.exports = {
  get_new_id,
  get_random_letter,
  get_random_number,
  get_random_of_multiple,
  is_even,
  get_random_of_array
};