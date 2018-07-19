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
      console.log(`${player.id} is stunned!`);
      player.has_moved = true;
      player.has_used_item = true;
      if ( player.sanity < 1 ) player.change_luck(0.02);
    },

    "trapped": player => {
      console.log(`${player.name} is trapped!`);
      player.has_moved = true;
    },

    "tied": player => {
      console.log(`${player.name} is tied up!`);
      player.has_used_item = true;
    },

    "paralyzed": player => {
      console.log(`${player.name} is paralyzed!`);
      player.has_moved = true;
      player.has_used_item = true;
      player.change_luck(0.05);
      
      player.inventory
        .filter(item => item.isFreeItem)
        .forEach(item => item.been_used = true);
    }
  };

  effects[effect](player);
};

// e.g. "draw 2 common" or "scare 0.4"
const trigger_variadic_effect = ( player, effectArr ) => {
  let [ effect, factor ] = effectArr;

  factor = parseFloat(factor);

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

const add_lingering_effect = client => player => effect => turns => {
  let counter = 0;
  player.add_status_effect(effect);

  const reapply = id => {
    if (player.id == id) {
      counter++;
      
      if ( counter > 1) {
        console.log("REAPPLY", player, effect);
        player.add_status_effect(effect);
        console.log(player.status_effects);
      }

      if ( counter == turns ) {
        client.socket.removeListener("END_DRAW_PHASE", reapply);
      }
    }
  };

  client.socket.on("END_DRAW_PHASE", reapply);
};


module.exports = {
  trigger_status_effect,
  add_lingering_effect
};