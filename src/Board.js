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

function Board(players) {

  let thePlayers = [];
  let history = [];
  let dealer;
  let deck;

  Object.defineProperties(this, {
    players: {
      get: function() {
        let copy = [];
        thePlayers.forEach(function(player) {
          copy.push(player.clone());
        });
        return copy;
      },
      set: function(players) {
        if (areValid(players)) {
          let copy = [];
          players.forEach(function(player) {
            copy.push(player.clone());
          });
          thePlayers = copy;
        }
      }
    },
    playRounds: {
      value: function() {
        thePlayers.forEach((player) => {
          if (deck.length === 1) {
            deck.reshuffle();
          } else {
            player.addToHand(deck.deal());
          }
        });
        for (let i = 0; i < thePlayers.length; i += 1) {
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
    deck = new Deck();
    dealer = new Dealer();
    deck.shuffle();
}

Object.defineProperties(Board.prototype, {
  toString: {
    value: function() {
        let history = this.history;
        let output = '';
        history.forEach(function(post) {
            output += post + '\n';
        });
      return output;
    }
  }
});

//helper functions

function round(aPlayer, aDealer, deck) {
  let winner;
  let bet = aPlayer.makeBet();

  if (!(turn(aPlayer)) && (aPlayer.points > 21 || turn(aDealer))) {
    winner = aDealer;
    aPlayer.bank -= bet;
  } else {
    aPlayer.bank += bet;
    winner = aPlayer;
  }

    let history = winner.name + ' wins!' + '\n' +
        '(PLAYER) ' + aPlayer.toString() + '\n' +
        '(DEALER) ' + aDealer.toString() + '\n';

  deck.returnToDeck(aDealer.reset());
  deck.returnToDeck(aPlayer.reset());

    return history;

  //helper functions
  function turn(player) {
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
