const repeatFn = (fn, times) => {
  while (times--) fn(...arguments);
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

const pushUnique = (arr, item) => {
  if (arr.some(thing => thing == item)) {
    return;
  }
  arr.push(item);
};

/**
 * Returns a new, shuffled array.
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

// Returns a new array with the item at the given index removed
const removeAtIndex = arr => index => {
  let tempArr = [...arr];
  tempArr = tempArr.slice(
    0,
    index
  ).concat(
    tempArr.slice(
      index + 1,
      tempArr.length
    )
  );

  return tempArr;
};

module.exports = {
  repeatFn,
  get_random_letter,
  get_random_number,
  pushUnique,
  removeAtIndex,
  shuffle_array,
  is_even,
  get_random_of_array,
  get_random_of_multiple
};