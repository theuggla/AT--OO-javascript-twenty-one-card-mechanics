/**
 * Module for Card.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

/**
 * Initiates a Card.
 *
 * @param value {string} the card value of the card.
 * @param suit {string} the suit of the card.
 */
function Card(value, suit) {

  let theSuit;
  let theValue;

  let theSuits = Card.suits;
  let theValues = Card.values;

  //set the suit
  if (!suit) {
    theSuit = getRandomSuit();
  } else if (theSuits.indexOf(suit.toUpperCase()) !== -1) {
    theSuit = suit.toUpperCase();
  } else {
    throw new Error(suit + ' is not a valid suit.');
  }

  //set the value
  if (!value) {
    theValue = getRandomValue();
  } else if (theValues.indexOf(value.toUpperCase()) !== -1) {
    theValue = value.toUpperCase();
  } else {
    throw new Error(value + ' is not a valid value.');
  }

  Object.defineProperties(this, {
    suit: {
      get: () => {
        return theSuit;
      },
      enumerable: true,
    },
    value: {
      get: () => {
        return theValue;
      },
      enumerable: true,
    }
  });

  //if card is an ace, keep track of whether it's worth 1 or 14
  if (this.value === 'ACE') {
    let theAceValue = 14; //start out as 14
    Object.defineProperty(this, 'acevalue', {
      get: () => {
        return theAceValue;
      },
      set: (value) => {
        if (value === 1 || value === 14) {
          theAceValue = value;
        } else {
          throw new Error('Invalid value for ace.');
        }
      }
    });
  }

  //helper functions
  function getRandomSuit() {
    return theSuits[Math.floor(Math.random() * theSuits.length)];
  }

  function getRandomValue() {
    return theValues[Math.ceil(Math.random() * (theValues.length - 1))]; //don't randomize a Joker
  }
}

//let writable. configurable and enumerable default to private to lock object down
Object.defineProperties(Card.prototype, { //prototype methods
  /**
   * Gives the value of the card, disregarding suit.
   * @returns {Number} the value.
   */
  valueOf: {
    value: function() {
      if (this.value === 'JOKER') {
        return -1;
      } else if (this.value === 'ACE') {
        return this.acevalue;
      } else {
        return Card.values.indexOf(this.value);
      }
    },
  },
  /**
   * Gives a string representation of the cards, containing suit and value.
   * @returns {String} the string representation.
   */
  toString: {
    value: function() {
      let output = '';
      if (this.value === 'JOKER') {
        output = this.value;
      } else {
        switch (this.suit) {
          case 'HEARTS':
            output += '♡';
            break;
          case 'SPADES':
            output += '♤';
            break;
          case 'CLUBS':
            output += '♧';
            break;
          case 'DIAMONDS':
            output += '♢';
            break;
        }
        if (this.value === 'ACE') {
          (output += this.acevalue);
        } else {
          (output += Card.values.indexOf(this.value));
        }
      }
      return output;
    },
  },
  /**
  * Compares to Cards to see if they are equal.
   * @param other {object} the object to compare to.
  * @returns {Boolean} true if the Cards have the same suit and value.
   * */
  equals: {
    value: function(other) {
      if (typeof other !== 'object') {
        return false;
      } else if (other !== other) {
        return false;
      } else if (other instanceof Card) {
        if (other.value === 'JOKER') {
          return this.value === 'JOKER';
        } else {
          return (other.suit === this.suit && other.value === this.value);
        }
      } else {
        return false;
      }
    },
  },
  /**
  * Compares the Card with another Card.
   * @param otherCard {Card} the object to compare to.
  * @returns {Number} >0 if the value of this Card is
   * greater than the value of the other Card.
   * @throws {TypeError} if the arguments is not a Card.
   * */
  compareTo: {
    value: function(otherCard) {
      if (otherCard instanceof Card) {
        return this.valueOf() - otherCard.valueOf();
      } else {
        throw new TypeError('Can\'t compare ' + otherCard + ' with a Card.');
      }
    },
  },
  /**
   * Makes an independent copy of this Card.
   * @returns {Card} the copy.
   */
  clone: {
    value: function() {
      let copy = new Card(this.value, this.suit);
      if (this.acevalue) {
        copy.acevalue = this.acevalue;
      }
      return copy;
    },
  },
  /**
   * Makes a JSON representation of this Card, containing the suit,
   * value and the acevalue if one exists.
   * @returns a JSON-object.
   */
  toJSON: {
    value: function() {
      let json = {
        suit: this.suit,
        value: this.value
      };
      if (this.acevalue) {
        json.acevalue = this.acevalue;
      }
      return json;
    },
  }
});

Object.defineProperties(Card, { //static properties and methods
  /**
   * Gives the valid Card suits.
   * @returns {Array} the valid suits for the Card type.
   */
  suits: {
    get: () => {
      return ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'];
    },
    enumerable: true,
  },
  /**
   * Gives the valid Card values.
   * @returns {Array} the valid values for the Card type.
   */
  values: {
    get: () => {
      return ['JOKER', 'ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];
    },
    enumerable: true,
  },
  /**
   * Checks if an object is a valid card.
   * @param card {object} the object to check.
   * @returns {Boolean} true if the object is of Card type and has a valid suit and value.
   */
  isValid: {
    value: function(card) {
      if (!(card instanceof Card)) {
        return false;
      } else if (!card.suit || !card.value) {
        return false;
      } else if (Card.suits.indexOf(card.suit) === -1 || Card.values.indexOf(card.value) === -1) {
        return false;
      }
      return true;
    },
  }
});

/**
 *  Exports.
 */
module.exports = Card;
