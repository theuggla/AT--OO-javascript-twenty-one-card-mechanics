/**
 * Module for Board.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

let Dealer = require('../src/Dealer.js');
let Deck = require('../src/Deck.js');
let BlackJackPlayer = require('../src/BlackJackPlayer.js');

/**
 * Initiates an Object of type Board, with a Dealer and a Deck.
 * @param players {Array} the BlackJackPlayers to play the game.
 */
function Board(players) {

  let thePlayers = [];
  let history = [];
  let dealer = new Dealer('Marvin');
  let deck = new Deck().shuffle();

  Object.defineProperties(this, {
    players: {
      get: () => {
        return thePlayers.map((player) => player.clone());
      },
      set: (players) => {
        if (areValid(players)) {
          if (!Array.isArray(players)) {
            thePlayers = [];
            thePlayers.push(players.clone());
          } else {
            thePlayers = players.map((player) => player.clone());
          }
        } else {
          throw new TypeError(players.toString() + ' are not able to play this game.');
        }
      }
    },
    playRounds: { //plays a round with each of the players against the dealer
      value: function() {
          history = [];
        let firstDeal = '';
        thePlayers.forEach((player) => { //deal everyone a card
          if (deck.length === 1) {
            deck.reshuffle();
          } else {
            player.addToHand(deck.deal());
            firstDeal += player.toString() + '\n';
          }
        });
        history.push(firstDeal); //record the deal
        for (let i = 0; i < thePlayers.length; i += 1) { //play everyone against the dealer
          history.push(round(thePlayers[i], dealer, deck));
        }
      }
    },
    history: {
      get: function() {
        return history.slice();
      }
    }
  });

  this.players = players;
}

/**
 * Gives a string representation of the board.
 * @returns {string} a record of all the players hands and results.
 */
Object.defineProperties(Board.prototype, {
  toString: {
    value: function() {
      let history = this.history;
      let output = '';
      if (history.length === 0) {
        output = 'No rounds played on this board.';
      } else {
        history.forEach(function(post) {
          output += post + '\n';
        });
      }
      return output;
    }
  }
});

//helper functions

function round(aPlayer, aDealer, deck) {
  let winner;
  let bet = aPlayer.makeBet();

  if (!(winsTurn(aPlayer)) && (aPlayer.points > 21 || winsTurn(aDealer))) {
    winner = aDealer;
    aPlayer.bank -= bet;
  } else {
    aPlayer.bank += bet;
    winner = aPlayer;
  }

  //record the round
  let history = winner.name + ' wins!' + '\n' +
      '(PLAYER) ' + aPlayer.toString() + '\n' +
      '(DEALER) ' + aDealer.toString() + '\n';

  //get the cards back
  deck.returnToDeck(aDealer.reset());
  deck.returnToDeck(aPlayer.reset());

  return history;

  function winsTurn(player) {
    while (player.requestCard() && !(isWinner(player))) {
      if (deck.length === 1) {
        deck.reshuffle();
      }
      player.addToHand(deck.deal());
    }
    return isWinner(player);
  }

  function isWinner(player) {
    if (player instanceof BlackJackPlayer) {
      return (player.points === 21) || (player.hand.length === 5 && player.points < 21);
    } else if (player instanceof Dealer) {
      return ((player.points > aPlayer.points) && (player.points <= 21));
    }
  }

}

function areValid(players) {
  let result = true;

  if (!Array.isArray(players)) {
    return players instanceof BlackJackPlayer;
  }

  players.forEach((player) => {
    if (!(player instanceof BlackJackPlayer)) {
      result = false;
    }
  });
  return result;
}

module.exports = Board;
