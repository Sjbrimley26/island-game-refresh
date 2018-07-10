const R = require("rambda");
const { get_random_number } = require("../client/assets/network/utilities");

const addSocketFunctions = io => {
  io.players = {};
  io.victory = false;

  let turn = 0;
  let trueTurn = 0;
  const minimumPlayers = 2;
  let playerCount = 0;
  let turnOrder = [];

  const check_if_enough_players = () => {
    return playerCount >= minimumPlayers; 
  };

  const find_player_by_id = id => {
    return R.find(player => player.id === id);
  };

  const get_initiative = () => {
    let random_already_used;
    let random;
    do {
      random = get_random_number(0, 100);
      random_already_used = Object.values(io.players).some(player => {
        return player.initiative <= random;
      });
    } while (random_already_used)

    return random;
  };

  const broadcast = (action, payload) => {
    return io.sockets.emit(action, payload);
  };

  const update_user_broadcast = broadcast.bind(this, "UPDATE_USERS", io.players);
  const disconnect_broadcast = broadcast.bind(this, "disconnect", io.players);
  const next_turn_broadcast = R.curry(broadcast)("NEXT_TURN");

  io.on("connection", socket => {

    socket.on("ADD_USER", user => {
      // console.log(`User #${user.id} connected!`);
      user.initiative = get_initiative();
      io.players[user.id] = user;
      socket.user = user;
      update_user_broadcast();
      
      playerCount++;
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
        delete io.players[socket.user.id];
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

        update_user_broadcast();
        disconnect_broadcast();
        playerCount--;

        /*
          If someone disconnects on their turn, it goes to the next person, but
          it causes the player to go twice if they are the only one remaining and then
          someone else joins with a higher initiative.
          One temporary fix would be to make every player join with a lower initiative and 
          then shuffle it after the game officially begins. 
          (That's what I'm gonna do for now)
        */
        if (deletedIndex === turn && Object.values(io.players).length != 1) {
          if (turn + 1 <= Object.values(io.players).length - 1) {
            turn++;
          } else {
            turn = 0;
          }
          trueTurn++;
          next_turn_broadcast(turnOrder[turn]);
        }
        else if (Object.values(io.players).length === 1) {
          turn = 0;
          trueTurn = 0;
        }
      }

    });

    socket.on("END_TURN", () => {
      turn++;
      trueTurn++;
      if (turn >= playerCount) {
        turn = 0;
      }
      next_turn_broadcast(turnOrder[turn]);

    });

    socket.on("PLAYER_MOVE", payload => {
      const { player, x, y } = payload;
      const affectedPlayer = find_player_by_id(player.id)(io.players);
      affectedPlayer.x = x;
      affectedPlayer.y = y;
      update_user_broadcast();
    });
    

  });

  return io;
}

module.exports = {
  addSocketFunctions
};