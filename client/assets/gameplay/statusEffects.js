const trigger_status_effect = player => effect => {
  let effectArr = effect.split(" ");
  if ( effectArr.length > 1 ) {
    trigger_variadic_effect(player, effectArr);
  } else {
    trigger_static_effect(player, effect);
  }
};

const trigger_static_effect = ( player, effect ) => {
  const effects = {
    "stunned": player => {
      console.log(`${player.name} is stunned!`);
    },

    "trapped": player => {
      console.log(`${player.name} is stunned!`);
    },

    "tied": player => {
      console.log(`${player.name} is stunned!`);
    },

    "paralyzed": player => {
      console.log(`${player.name} is stunned!`);
    }
  };

  effects[effect](player);
};

const trigger_variadic_effect = ( player, effectArr ) => {
  const [ effect, factor ] = effectArr;

  if ( effectArr[2] ) {
    let opt = effectArr[2];
  }

  const effects = {
    "draw": (player, factor, itemNameOrRarity) => {
      for (let i = 0; i < factor; i++) {
        player.pick_up_item(itemNameOrRarity);
      }
    },

    "recharge": (player, factor) => {
      // factor should be like an index in the inventory or
      // just target a random item
    },

    "scare": (player, factor) => {
      player.change_sanity(factor);
    },

    "karma": (player, factor) => {
      player.change_luck(factor);
    },
  };

  if (opt) {
    effects[effect](player, factor, opt);
  } else { 
    effects[effect](player, factor);
  }
};


module.exports = {
  trigger_status_effect
};