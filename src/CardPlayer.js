/**
 * Module for CardPlayer.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');
const Deck = require('../src/Deck.js');

function CardPlayer(name = 'The Player') {
  if (this.constructor === CardPlayer) {
    throw new Error('Can\'t make instances of this class');
  }

  let theName;
  let theHand = [];

  Object.defineProperties(this, {
    name: {
      get: function() {
        return theName;
      },
      set: function(name) {
        if (typeof name === 'string') {
          if (name.length > 0 && name.length < 21) {
            theName = name;
          } else {
            throw new Error('Name has wrong length.');
          }
        } else {
          throw new TypeError('Name is not a string.');

        }
      },
      enumerable: true,
    },
    hand: {
      get: function() {
        return copyHand(theHand);
      },
      set: function(hand) {
        if (Array.isArray(hand)) {
          if (hand.length === 0) { //allow to be set to 0
            theHand = [];
          } else if (isValidHand) {
            theHand = copyHand(hand);
          } else {
            throw new Error('The hand is not a valid hand.');
          }
        } else {
          throw new TypeError('Must be Array!');
        }
      },
      enumerable: true,
    },
    points: {
      get: function() {
        if (getPoints(theHand) > 21) {
          theHand = adjustForAce(theHand);
        }

        return getPoints(theHand);
      },
      enumerable: true,
    }
  });

  this.name = name;
}

Object.defineProperties(CardPlayer.prototype, {
  valueOf: {
    value: function() {
      return this.points;
    },
    writable: true
  },
  toString: {
    value: function() {
      return this.name;
    },
    writable: true
  },
  equals: {
    value: function(other) {
      if (!(other instanceof CardPlayer)) {
        return false;
      } else if (this.name !== other.name) {
        return false;
      } else {
        let thisHand = this.hand;
        let otherHand = other.hand;
        for (let i = 0; i < thisHand.length; i += 1) {
          if (!thisHand[i].equals(otherHand[i])) {
            return false;
          }
        }
        return true;
      }
    },
    writable: true
  },
  addToHand: {
    value: function(card) {
      let theHand = this.hand;
      if (Card.isValid(card)) {
        theHand.push(card.clone());
      } else {
          throw new Error('Tried to add non-valid Card to hand.');
      }
      this.hand = theHand;
    },
    writable: true
  },
  reset: {
    value: function() {
      let theHand = this.hand;
      this.hand = [];
      return theHand;
    },
    writable: true
  }
});

//helper functions
function copyHand(hand) {
  return hand.map((card) => card.clone());
}

function isValidHand(hand) {
  hand.forEach(function(card) {
    if (!Card.isValid(card)) {
      return false;
    }
  });
  return true;
}

function getPoints(hand) {
  return hand.reduce(function(a, b) {
    return a + b;
  }, 0);
}

function adjustForAce (hand) {
  let aceIndices = Deck.findAll(hand, 'ace');

  if (aceIndices) {
    for (let i = 0; i < aceIndices.length && getPoints(hand) > 21; i += 1) {
      hand[aceIndices[i]].acevalue = 1;
    }
  }
  return hand;
}

/*
* Exports.
*/
module.exports = CardPlayer;

