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

function Board() {
  this.deck = new Deck();
  this.dealer = new Dealer();
  this.history = undefined;
  this.currentPlayer = undefined;
}

Object.defineProperties(Board.prototype, {
  startGame: {
    value: function(players) {
      players.forEach((player) => {
        if (this.deck.length === 1) {
          this.deck.reshuffle();
        }
        player.addToHand(this.deck.deal());
      });
    }
  },
  playTurn: {
    value: function(player) {
      let that = this;
      let turn = function(player) {
        while (player.requestCard()) {
          if (that.deck.length === 1) {
            that.deck.reshuffle();
          }
          player.addToHand(that.deck.deal());
        }
        return isWinner(player);
      };

      let isWinner = function(thePlayer) {
        if (thePlayer instanceof BlackJackPlayer) {
          return (thePlayer.points === 21) || (thePlayer.hand.length === 5 && thePlayer.points < 21);
        } else if (thePlayer instanceof Dealer) {
          return ((thePlayer.points > that.currentPlayer.points) && (thePlayer.points <= 21));
        }
      };
      let winner;
      this.currentPlayer = player;
      let bet = player.makeBet();

      if (turn(player)) {
        player.bank += bet * 2;
        winner = player;
      } else if (turn(this.dealer)) {
        winner = this.dealer;
        player.bank -= bet;
      } else {
        player.bank += bet * 2;
        winner = player;
      }

      this.history = winner.name + ' wins!' + '\n' +
          'PLAYER: ' + player.toString() + '\n' +
          'DEALER: ' + this.dealer.toString() + '\n';

      this.deck.returnToDeck(this.dealer.reset());
      this.deck.returnToDeck(player.reset());
    }
  },
  toString: {
    value: function() {
      return this.history;
    }
  }
});

module.exports = Board;
