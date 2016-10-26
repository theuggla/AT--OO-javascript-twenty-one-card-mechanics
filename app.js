/**
 * Starting  point of the application.
 *
 * Creates an array of 5 BlackJackPlayers,
 * and plays rounds with them on the same board
 * until only 1 has money left.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Player = require('./src/BlackJackPlayer.js');
const Board = require('./src/Board.js');

let players = [];

for (let i = 0, limit = 13; i < 5; i += 1, limit += 1) {
  players[i] = new Player('Player ' + (i + 1), limit); //give them different limits
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
        console.log(players[i].name + ' was eliminated.');
      players.splice(i, 1);  //remove the player
    }
  }
  theBoard.players = players;

  round += 1;
}

//print result
console.log(theBoard.players[0].name + ' is the last one standing with £' + theBoard.players[0].bank + ' in the bank!');
console.log(round + ' rounds were played.');
