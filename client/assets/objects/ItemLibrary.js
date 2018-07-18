import {
  createItem
} from "./Item";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const rabbit_foot = createItem("rabbit foot", "common").withCharges().isFree();
const fate_coin = createItem("coin of fate", "uncommon").withCharges(3).isFree(); //Okay so now charges will be a random number
const dark_orb = createItem("dark orb", "rare").withCharges(4); //between 1 and this number, determined on pick up
const cursed_portal = createItem("cursed portal", "rare").withCharges().targetsTile(20);
const gelatinous_mass = createItem("gelatinous mass", "uncommon").withCharges();
const magic_batteries = createItem("magic batteries", "uncommon").withCharges().isFree().targetsItem();
const draw_two = createItem("draw two", "common").withCharges();
const draw_four = createItem("draw four", "uncommon").withCharges().targetsEnemy(8);
const rock = createItem("rock", "special").withCharges(2); //special items won't be randomly chosen
const lucky_lasso = createItem("lucky lasso", "common").withCharges().targetsEnemy(4);
const jack_in_the_box = createItem("jack in the box", "common").withCharges(3).targetsTile(10);
const felix_felicis = createItem("felix felicis", "uncommon").withCharges().isFree();
const mulligan = createItem("mulligan", "common").withCharges();
const regift = createItem("regift", "common").withCharges().targetsItem();
const upgrade = createItem("upgrade", "uncommon").withCharges().targetsItem();

const switcheroo = 
  createItem("switcheroo", "common")
  .withCharges()
  .targetsEnemy(10)
  .targetsItem();

const trade = 
  createItem("trade", "common")
  .withCharges()
  .targetsEnemy(7)
  .targetsItem();

const caltrops = createItem("caltrops", "common").withCharges(2).targetsTile(5);
const bola_trap = createItem("bola trap", "common").withCharges(2).targetsTile(5);
const tesla_coil = createItem("tesla coil", "uncommon").withCharges().targetsTile(5);

const distracting_magazine = 
  createItem("distracting magazine", "uncommon")
  .withCharges()
  .targetsTile(8);

const net_gun = createItem("net gun", "uncommon").withCharges().targetsEnemy(5);
const finger_trap = createItem("finger trap", "uncommon").withCharges().targetsEnemy(4);
const portable_hole = createItem("portable hole", "rare").withCharges(4);

const itemList = [
  rabbit_foot,
  fate_coin,
  dark_orb,
  cursed_portal,
  gelatinous_mass,
  magic_batteries,
  draw_two,
  draw_four,
  rock,
  lucky_lasso,
  jack_in_the_box,
  felix_felicis,
  mulligan,
  regift,
  upgrade,
  switcheroo,
  trade,
  caltrops,
  bola_trap,
  tesla_coil,
  distracting_magazine,
  net_gun,
  finger_trap,
  portable_hole
];

const commonsList = itemList.filter(item => item.rarity === "common");
const uncommonsList = itemList.filter(item => item.rarity === "uncommon");
const raresList = itemList.filter(item => item.rarity === "rare");
const normalsList = itemList.filter(item => item.rarity !== "special");

const itemDB = {
  itemList,
  commonsList,
  raresList,
  uncommonsList,
  normalsList,

  getRandomCommon(exclusion) {
    //exclusion must be a name
    //returns any random common item but the exclusion
    if (!exclusion) {
      return this.commonsList[getRandomInt(this.commonsList.length)];
    } else {
      let newItem;
      do {
        newItem = this.commonsList[getRandomInt(this.commonsList.length)];
      } while (newItem.name === exclusion);
      return newItem;
    }
  },

  getRandomUncommon(exclusion) {
    if (!exclusion) {
      return this.uncommonsList[getRandomInt(this.uncommonsList.length)];
    } else {
      let newItem;
      do {
        newItem = this.uncommonsList[getRandomInt(this.uncommonsList.length)];
      } while (newItem.name === exclusion);
      return newItem;
    }
  },

  getRandomRare(exclusion) {
    if (!exclusion) {
      return this.raresList[getRandomInt(this.raresList.length)];
    } else {
      let newItem;
      do {
        newItem = this.raresList[getRandomInt(this.raresList.length)];
      } while (newItem.name === exclusion);
      return newItem;
    }
  },

  getRandomItem() {
    return this.normalsList[getRandomInt(this.normalsList.length)];
  },

  getItem(name) {
    return this.itemList.find(item => item.name === name);
  }
};

export default itemDB;
