/**
 * Module for BlackJackPlayer.
 * @augments CardPlayer
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const CardPlayer = require('../src/CardPlayer.js');

function BlackJackPlayer(name = 'Blackjack Player') {
  CardPlayer.call(this, name);

  const LIMIT = 15;
  const BET = 30;
  let bank = 100;

  Object.defineProperties(this, {
    limit: {
      get: function() {
        return LIMIT;
      },
      enumerable: true,
    },
    bank: {
      get: function() {
        return bank;
      },
      set: function(value) {
        if (typeof value === 'number' && value >= 0) {
          bank = value;
        } else {
          throw new Error('Invalid bank value.');
        }
      },
      enumerable: true,
    },
    bet: {
        get: function() {
          return BET;
        },
        enumerable: true
      },
    inPlay: {
      get: function() {
        return (this.points < 21 && bank > 0);
      },
    }
  });
}

BlackJackPlayer.prototype = Object.create(CardPlayer.prototype);

Object.defineProperties(BlackJackPlayer.prototype, {
  constructor: {
    value: BlackJackPlayer
  },
  requestCard: {
    value: function() {
      if (this.inPlay) {
        return this.points < this.limit;
      }
      return false;
    },
    writable: true,
  },
  makeBet: {
    value: function() {
      let bet;
      if ((this.bank - this.bet) >= 0) {
        bet = this.bet;
      } else {
        bet = this.bank;
      }
      this.bank -= bet;
      return bet;
    },
  },
  toString: {
    value: function() {
      let output = this.name + ' (£' + this.bank + '): ';
      this.hand.forEach(function(card) {
        output += card.toString() + ' ';
      });
      output += '(' + this.points + ')';
      if (this.points > 21) {
        output += ' BUSTED!';
      }
      if (this.bank === 0) {
        output += ' OUT OF FUNDS!';
      }
      return output;
    }
  },
  clone: {
    value: function() {
      let copy = new BlackJackPlayer(this.name);
      copy.hand = copyHand(this.hand);
      return copy;
    },
    writable: true
  }
});

//helper functions
function copyHand(hand) {
  return hand.map((card) => card.clone());
}

module.exports = BlackJackPlayer;
