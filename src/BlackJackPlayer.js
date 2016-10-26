/**
 * Module for BlackJackPlayer.
 * @augments CardPlayer
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const CardPlayer = require('../src/CardPlayer.js');

/**
 * Initiates a BlackJackPlayer.
 * @param name {string} the name of the player.
 * @param limit {number} the point at which the player stops requesting cards.
 */
function BlackJackPlayer(name = 'Blackjack Player', limit = 15) {
  CardPlayer.call(this, name); //call CardPlayer constructor

  const LIMIT = limit;
  const BET = 25;
  let bank = 100;

  Object.defineProperties(this, {
    limit: {
      get: () => {
        return LIMIT;
      },
      enumerable: true,
    },
    bank: {
      get: () => {
        return bank;
      },
      set: (value) => {
        if (typeof value === 'number' && value >= 0) {
          bank = value;
        } else {
          throw new Error('Invalid bank value.');
        }
      },
      enumerable: true,
    },
    bet: {
        get: () => {
          return BET;
        },
        enumerable: true
      },
    inPlay: {
      get: () => {
        return (this.points < 21 && bank > 0);
      },
    }
  });
}

//inherit CardPlayer
BlackJackPlayer.prototype = Object.create(CardPlayer.prototype);

//prototype methods
Object.defineProperties(BlackJackPlayer.prototype, {
  constructor: {
    value: BlackJackPlayer
  },
  /**
   * Returns a boolean to determine if the player wants another Card.
   * @returns {Boolean} true if Player is in play and their points is below their limit.
   */
  requestCard: {
    value: function() {
      if (this.inPlay) {
        return this.points < this.limit;
      }
      return false;
    },
    writable: true,
  },
  /**
   * Makes a bet for the player.
   * @returns {number} the player's bet.
   */
  makeBet: {
    value: function() {
      let bet;
      if ((this.bank - this.bet) >= 0) {
        bet = this.bet;
      } else {
        bet = this.bank;
      }
      return bet;
    },
  },
  /**
   * Gives a string representation of the player, consisting of their name and hand.
   * @returns {string} the name and hand of the player.
   */
  toString: {
    value: function() {
      let output = this.name + ' (£' + this.bank + '): ';
      if (this.hand.length === 0) {
        output += '-';
      } else {
        this.hand.forEach(function(card) {
          output += card.toString() + ' ';
        });
        output += '(' + this.points + ')';
      }
      if (this.points > 21) {
        output += ' BUSTED!';
      }
      if (this.bank === 0) {
        output += ' OUT OF FUNDS!';
      }
      return output;
    }
  },
  /**
   * Makes an independent copy of this player.
   * @returns {BlackJackPlayer} the copy.
   */
  clone: {
    value: function() {
      let copy = new BlackJackPlayer(this.name);
      copy.hand = copyHand(this.hand);
      copy.bank = this.bank;
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
