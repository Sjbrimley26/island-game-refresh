const { get_random_tile_XY } = require("../gameplay/tileFunctions");
const { get_random_int, get_new_id } = require("../gameplay/logic");
const { trigger_status_effect } = require("../gameplay/statusEffects");
const itemDB = require("./ItemLibrary").default;

const createUser = ( x, y, name ) => {
  return {
    name,
    id: get_new_id(),
    x,
    y,
    initiative: 0,
    luck: 0,
    sanity: 1,
    inventory: [],
    has_used_item: false,
    status_effects: [],

  }; 
};

const createSampleUser = name => {
  let [x, y] = [0, 0];
  while (
    x == 0 ||
    y == 0 ||
    x > 1080 ||
    y > 810
  ) {
    [x, y] = get_random_tile_XY();
  }

  return createUser( x, y, name );
  
};

const add_client_functions = player => client => {
  return {
    ...player,
    trigger_status_effect: trigger_status_effect(player),

    lucky_roll(max) {
      return Math.floor((Math.random() + this.luck) * max) + 1;
    },

    onStartTurn() {
      this.status_effects.forEach(effect => this.trigger_status_effect(effect));
      this.status_effects = [];
      this.has_used_item = false;
      this.pick_up_item("common");
    },

    onEndTurn() { 
      console.log(this.inventory);
    },

    pick_up_item(itemNameOrRarity) {
      let item;

      switch (itemNameOrRarity) {
        case "common":
          item = itemDB.getRandomCommon();
          break;
        case "uncommon":
          item = itemDB.getRandomUncommon();
          break;
        case "rare":
          item = itemDB.getRandomRare();
          break;
        case "random":
          item = itemDB.getRandomItem();
          break;
        default:
          item = itemDB.getItem(itemNameOrRarity);
          break;
      }

      if (item.charges != 1) {
        this.lucky_roll(100) < 85 ?
          item.charges = get_random_int(item.charges) :
          null;
      }

      this.inventory.push(item);

      client.socket.emit("UPDATE_ITEMS", this);

    },

    change_sanity(amount) {
      //amount should be between -1 and 1
      this.sanity = (this.sanity * 10 + amount * 10) / 10;
      if (this.sanity > 1) {
        this.sanity = 1;
      }
      if (this.sanity < 0) {
        this.sanity = 0;
      }
    },

    change_luck(amount) {
      //a luck of .5 rolling a 100-sided die will have a range of 50 - 150, that seems like a good range to me
      //so this amount should be between -.5 and .5, though I suppose it could be 1 for a complete flip
      //so all odds in this game will fall between -49% and 150%
      this.luck = (this.luck * 10 + amount * 10) / 10;
      if (this.luck > 0.5) {
        this.luck = 0.5;

      }
      if (this.luck < -0.5) {
        this.luck = -0.5;
      }
    },

    normalizeLuck() {
      const diff = Math.abs(this.luck) * 10 - 10;
      if (this.luck > 1) {
        this.change_luck(-Math.round(diff * 10 / 3) / 10);
      } else {
        this.change_luck(Math.round(diff * 10 / 3) / 10);
      }
    },

    goInsane() {
      this.sanity = 1;
      this.add_status_effect("stunned");
    },

    add_status_effect(effect) {
      if (this.status_effects.includes(effect)) return;
      this.status_effects.push(effect);
    }

  };
};

module.exports = {
  createSampleUser,
  add_client_functions
};