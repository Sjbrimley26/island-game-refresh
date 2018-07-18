const R = require("rambda");
const { get_random_number } = require("../client/assets/gameplay/logic");

const addSocketFunctions = io => {
  io.players = new Map();
  io.victory = false;

  const minimumPlayers = 2;

  let turn = 0;
  let trueTurn = 0;
  let turnOrder = [];

  const check_if_enough_players = () => {
    return io.players.size == minimumPlayers; 
  };

  const get_initiative = () => {
    let random_too_high;
    let random;
    do {
      random = get_random_number(0, 100);
      random_too_high = Object.values(io.players).every(player => {
        return player.initiative <= random;
      });
    } while (random_too_high)

    if (Object.values(io.players).length === 1) {
      random = 100;
    }

    return random;
  };

  const broadcast = action => payload => {
    if (payload instanceof Map) {
      payload = Array.from(payload);
    }
    return io.sockets.emit(action, payload);
  };

  const update_user_broadcast = broadcast("UPDATE_USERS");
  const disconnect_broadcast = broadcast("disconnect");
  const turn_zero_broadcast = broadcast("TURN_ZERO");
  const next_turn_broadcast = broadcast("NEXT_TURN");

  io.on("connection", socket => {

    socket.on("ADD_USER", user => {
      // console.log(`User #${user.id} connected!`);
      const { id } = user;
      user.initiative = get_initiative();
      io.players.set(id, user);
      socket.user = user;

      update_user_broadcast(io.players);
      
      turnOrder = turnOrder.concat(user).sort((a,b) => {
        return b.initiative - a.initiative;
      });
      
      if ( check_if_enough_players() && trueTurn == 0 ) {
        next_turn_broadcast(turnOrder[turn]);
      }
    
    });

    socket.on("disconnect", () => {
      if (socket.user) {
        // console.log(`User #${socket.user.id} disconnected!`);
        io.players.delete(socket.user.id);
        let deletedIndex = R.findIndex(user => user.id == socket.user.id)(turnOrder);

        turnOrder = turnOrder.slice(
          0,
          deletedIndex
        ).concat(
          turnOrder.slice(
            deletedIndex + 1,
            turnOrder.length
          )
        );

        update_user_broadcast(io.players);
        disconnect_broadcast(io.players);
        
        if ( deletedIndex == turn && io.players.size > 1 ) {
          if ( turn + 1 <= turnOrder.length - 1) {
            turn++;
          } else {
            turn = 0;
          }
          next_turn_broadcast(turnOrder[turn]);
        }
        else if ( io.players.size <= 1 ) {
          turn_zero_broadcast({});
        }
           
      }

    });

    socket.on("TURN_ZERO", () => {
      turn = 0;
      trueTurn = 0;
    });

    socket.on("END_TURN", () => {
      turn++;
      trueTurn++;
      if (turn >= io.players.size) {
        turn = 0;
      }
      next_turn_broadcast(turnOrder[turn]);

    });

    socket.on("PLAYER_MOVE", payload => {
      const { player, x, y } = payload;
      const affectedPlayer = io.players.get(player.id);
      affectedPlayer.x = x;
      affectedPlayer.y = y;
      update_user_broadcast(io.players);
    });

    socket.on("UPDATE_ITEMS", player => {
      const { id, inventory } = player;
      const affectedPlayer = io.players.get(id);
      affectedPlayer.inventory = inventory;
      update_user_broadcast(io.players);
    });
    

  });

  return io;
}

module.exports = {
  addSocketFunctions
};