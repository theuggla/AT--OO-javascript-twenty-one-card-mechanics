/**
 * Starting  point of the application.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Player = require('./src/BlackJackPlayer.js');
const Board = require('./src/Board.js');

let players = [];

for (let i = 0; i < 10; i += 1) {
  players[i] = new Player('Player ' + i);
}

let theBoard = new Board(players);
let round = 1;

while (players.length > 1) {

  console.log('Round ' + round);
  theBoard.playRounds();
  console.log(theBoard.toString());

    players = theBoard.players;
  for (let i = 0; i < players.length; i += 1) {
    if (players[i].bank === 0) { //if a player does not have money left
      players.splice(i, 1);  //remove the player
    }
  }
    theBoard.players = players;

  round += 1;
}

console.log(theBoard.players[0].name + ' is the winner with £' + theBoard.players[0].bank + ' in the bank!');

