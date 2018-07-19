const use_item = client => player => item => {
  if ( item.isFreeItem ) {
    item.been_used = true;
  }

  if ( item.hasCharges ) {
    item.charges--;
  }

  if ( item.charges === 0 ) {
    player.inventory = player.inventory.filter(i => i.id !== item.id);
  }

  if ( item.targetsEnemy ) {}

  if ( item.targetsTile ) {}

  if ( item.targetsItem ) {}

  trigger_item_effect(client, player, item);
  
};

const trigger_item_effect = ( client, player, item ) => {

};

module.exports = {
  use_item
};