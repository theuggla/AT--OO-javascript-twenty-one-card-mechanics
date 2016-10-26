/**
 * Module for CardPlayer.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');
const Deck = require('../src/Deck.js');

/**
 * Initiates a CardPlayer.
 * @abstract don't initiate the type.
 * @param name {string} the name of the player.
 */
function CardPlayer(name = 'The Player') {
  if (this.constructor === CardPlayer) {
    throw new Error('Can\'t make instances of this class'); //don't let the type be initiated
  }

  let theName;
  let theHand = [];

  Object.defineProperties(this, {
    name: {
      get: () => {
        return theName;
      },
      set: (name) => {
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
      get: () => {
        return copyHand(theHand);
      },
      set: (hand) => {
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
      get: () => {
        if (getPoints(theHand) > 21) { //if points > 21, change the value of potential aces to 1
          theHand = adjustForAce(theHand);
        }

        return getPoints(theHand);
      },
      enumerable: true,
    }
  });

  this.name = name;
}

//prototype methods
Object.defineProperties(CardPlayer.prototype, {
  /**
   * Gives the value of the Player, by giving the added points of the hand.
   * @returns {number} the Players points.
   */
  valueOf: {
    value: function() {
      return this.points;
    },
    writable: true
  },
  /**
   * Gives a string representation of the player.
   * @returns {string} the players name.
   */
  toString: {
    value: function() {
      return this.name;
    },
    writable: true
  },
  /**
   * Compares an object to this CardPlayer to see if they are equal.
   * @param other {object} the object to compare to.
   * @returns true if the two CardPlayers have the same name and the same Cards on hand.
   */
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
  /**
   * Adds a Card to the player's hand.
   * @param card {Card} the Card to add.
   * @returns this.
   * @throws {Error} if the Card is not valid.
   */
  addToHand: {
    value: function(card) {
      let theHand = this.hand;
      if (Card.isValid(card)) {
        theHand.push(card.clone());
      } else {
        throw new Error('Tried to add non-valid Card to hand.');
      }
      this.hand = theHand;
      return this;
    },
    writable: true
  },
  /**
   * Resets the players hand to the empty Array.
   * @returns the players hand.
   */
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
  let result = true;
  hand.forEach((card) => {
    if (!Card.isValid(card)) {
      result = false;
      return result;
    }
  });
  return result;
}

function getPoints(hand) {
  return hand.reduce((a, b) => {
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

