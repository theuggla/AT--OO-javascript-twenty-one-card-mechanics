/**
 * Starting  point of the application.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Deck = require('./src/Deck.js');
const Player = require('./src/BlackJackPlayer.js');
const Card = require('./src/Card.js');
const Board = require('./src/Board.js');

let players = [];

for (let i = 0; i < 10; i += 1) {
    players[i] = new Player('Player ' + i);
}

let theBoard = new Board();

for (let i = 0; i < 10; i += 1) {
    players[i].addToHand(theBoard.theDeck.deal());
    console.log(players[i].toString());
}

console.log();
let round = 1;

while (players.length > 1) {
    console.log('Round ' + round);
    for (let i = 0; i < players.length; i += 1) {
        theBoard.playRound(players[i]);
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
