const { get_random_tile_XY } = require("../gameplay/tileFunctions");
const { get_new_id } = require("../gameplay/logic");
const {
  get_random_number,
  removeAtIndex,
  repeatFn
} = require("../gameplay/utilities");
const { trigger_status_effect } = require("../gameplay/statusEffects");
const { use_item } = require("../gameplay/itemEffects");
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
    has_moved: false,
    has_used_item: false,
    status_effects: [],
    lasting_effects: [],

  }; 
};

const createSampleUser = name => {
  let [x, y] = [0, 0];
  while (
    x == 0 ||
    y == 0 ||
    x > 700 ||
    y > 600
  ) {
    [x, y] = get_random_tile_XY();
  }

  return createUser( x, y, name );
  
};

const add_client_functions = client => player => {
  return {
    ...player,
    trigger_status_effect: trigger_status_effect(player),
    use_item: use_item(client)(player),

    findRock() {
      return this.inventory.findIndex(i => {
        return i.name === "rock";
      });
    },

    findItemByRarity(rarity) {
      return this.inventory.findIndex(i => {
        return i.rarity === rarity;
      });
    },

    lucky_roll(max) {
      return Math.floor((Math.random() + this.luck) * max) + 1;
    },

    onStartTurn() {
      this.has_used_item = false;
      this.has_moved = false;
      console.log(this.status_effects);
      this.status_effects.forEach(effect => this.trigger_status_effect(effect));
      this.status_effects = [];

      if (Math.abs(this.luck) - 1 > 0.3) {
        this.normalizeLuck(); //So if a player has high or low luck, it decreases a bit at the start
        //of each turn.
      }

      if (this.sanity === 0) {
        this.goInsane();
      }

      /*

      if (this.turn >= 5) {
        let diceRoll = lucky_roll(100, this);
        let item = diceRoll < 10 ? "rock" : diceRoll > 90 ? "rare" : "uncommon";
        item === "rock" ?
          this.pickUpItem(itemDB.getItem("rock")) :
          item === "rare" ?
          this.pickUpItem(itemDB.getRandomRare()) :
          this.pickUpItem(itemDB.getRandomUnommon());
      }

      */

      // console.log("PRE_DRAW", this.inventory);
      this.pick_up_item("common");
      client.socket.emit("END_DRAW_PHASE", this.id);
      // console.log("END_DRAW_PHASE", this.inventory);
    },

    onEndTurn() { 
      // console.log("END_TURN", this.inventory);
      this.discard_excess_items();
      // console.log("POST_DISCARD", this.inventory);
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
          item.charges = get_random_number(0, item.charges + 1) :
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
    },

    discard_excess_items() {
      if (this.inventory.length > 6) {
        do {

          if (this.lucky_roll(100) >= 75) {
            let luckyIndex = this.findRock();
            luckyIndex = luckyIndex < 0 ? this.findItemByRarity("common") : luckyIndex;
            luckyIndex = luckyIndex < 0 ? this.findItemByRarity("uncommon") : luckyIndex;
            luckyIndex = luckyIndex < 0 ? this.findItemByRarity("rare") : luckyIndex;
            this.inventory = removeAtIndex(this.inventory)(luckyIndex);
          } else {
            this.inventory = removeAtIndex(this.inventory)(get_random_number(0, this.inventory.length));
          }

        } while (this.inventory.length > 6);
      }
    }

  };
};

module.exports = {
  createSampleUser,
  add_client_functions
};