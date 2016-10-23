/**
 * Module for Dealer.
 * @augments CardPlayer
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const CardPlayer = require('../src/CardPlayer.js');

function Dealer(name = 'The Dealer') {
  CardPlayer.call(this, name);

  Object.defineProperties(this, {
    inPlay: {
      get: function() {
        return this.points < 21;
      },
    },
  });
}

Dealer.prototype = Object.create(CardPlayer.prototype);

Object.defineProperties(Dealer.prototype, {
  constructor: {
    value: Dealer
  },
  requestCard: {
    value: function() {
      return this.inPlay;
    }
  },
  toString: {
    value: function() {
      let output = this.name + ': ';
      this.hand.forEach(function(card) {
        output += card.toString() + ' ';
      });
      output += '(' + this.points + ')';
      if (this.points > 21) {
        output += ' BUSTED!';
      }
      return output;
    }
  },
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
