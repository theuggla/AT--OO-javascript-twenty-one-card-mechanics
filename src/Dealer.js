/**
 * Module for Dealer.
 * @augments CardPlayer
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const CardPlayer = require('../src/CardPlayer.js');

/**
 * Initiates a Dealer.
 * @param name {string} the name of the dealer.
 */
function Dealer(name = 'The Dealer') {
  CardPlayer.call(this, name); //call the CardPlayer constructor

  Object.defineProperties(this, {
    inPlay: {
      get: function() {
        return this.points < 21;
      },
    },
  });
}

//inherit CardPlayer
Dealer.prototype = Object.create(CardPlayer.prototype);

//prototype methods
Object.defineProperties(Dealer.prototype, {
  constructor: {
    value: Dealer
  },
  /**
   * Returns a boolean to determine if the Dealer wants another Card.
   * @returns {Boolean} true if Dealer's points is below their limit.
   */
  requestCard: {
    value: function() {
      return this.inPlay;
    }
  },
  /**
   * Gives a string representation of the  Dealer, consisting of their name and hand.
   * @returns {string} the name and hand of the Dealer.
   */
  toString: {
    value: function() {
      let output = this.name + ': ';
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
      return output;
    }
  },
  /**
   * Makes an independent copy of this player.
   * @returns {Dealer} the copy.
   */
  clone: {
    value: function() {
      let copy = new Dealer(this.name);
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

module.exports = Dealer;
