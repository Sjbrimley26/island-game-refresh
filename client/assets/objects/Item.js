const { get_new_id } = require("../gameplay/logic");

const createItem = (name, rarity) => {
  return {
    name,
    rarity,
    id: get_new_id(),

    withCharges ( initialCharge = 1 ) {
      this.charges = initialCharge;
      this.hasCharges = true;

      this.addCharge = () => {
        if ( this.charges + 1 <= initialCharge * 2 ) {
          this.charges++;
        }
        return this.charges;
      }

      this.isFree = () => {
        this.been_used = false;
        this.isFreeItem = true;

        this.onStartTurn = () => {
          this.been_used = false;
        };

        return this;
      }

      return this;
    },

    targetsEnemy ( range = 1 ) {
      this.targetsEnemy = true;
      this.range = range;
      return this;
    },

    targetsItem () {
      this.targetsItem = true
      return this;
    },

    targetsTile ( range = 1 ) {
      this.targetsTile = true;
      this.range = range;
      return this;
    }

  };
}

module.exports = {
  createItem
};
