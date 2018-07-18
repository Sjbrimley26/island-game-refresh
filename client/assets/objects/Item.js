// Probably going to have to migrate the items' use function into the Player
// Object or some other way.

const createItem = (name, rarity) => {
  return {
    name,
    rarity,

    use () {
      //Normal "Use" Case
      console.log(`${this.name} was used`);
    },

    withCharges ( initialCharge = 1 ) {
      this.charges = initialCharge;

      this.addCharge = () => {
        if ( this.charges + 1 <= initialCharge * 2 ) {
          this.charges++;
        }
        return this.charges;
      }

      this.use = () => {
        if  ( this.charges >= 1 ) {
          this.charges--;
          console.log(`${this.name} was used!`);
        }
      }

      this.isFree = () => {
        this.been_used = false;

        this.use = () => {
          if (this.charges >= 1) {
            this.charges--;
            this.been_used = true;
            console.log(`${this.name} was used!!!`);
          }
        };

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
