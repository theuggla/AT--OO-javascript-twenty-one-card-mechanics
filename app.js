/**
 * Starting  point of the application.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Player = require('./src/BlackJackPlayer.js');
const Board = require('./src/Board.js');

let theBoard = new Board();
let round = 1;
let players = [];

for (let i = 0; i < 10; i += 1) {
  players[i] = new Player('Player ' + i);
}

while (players.length > 1) {
  console.log('Round ' + round);
  theBoard.startGame(players);
  players.forEach((player) => {
    console.log(player.toString());
  });

  for (let i = 0; i < players.length; i += 1) {
    theBoard.playTurn(players[i]);
    console.log(theBoard.toString());
  }

  for (let i = 0; i < players.length; i += 1) {
    if (players[i].bank === 0) { //if a player does not have money left
      players.splice(i, i + 1);  //remove the player
    }
  }
  round += 1;
}

console.log(players[0].name + ' is the winner with ' + players[0].bank + 'in the bank!');
