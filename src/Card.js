/**
 * Module for Card.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

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
      get: function() {
        return theSuit;
      },
      enumerable: true,
    },
    value: {
      get: function() {
        return theValue;
      },
      enumerable: true,
    }
  });

  if (this.value === 'ACE') {
    let theAceValue = 14;
    Object.defineProperty(this, 'acevalue', {
      get: function() {
        return theAceValue;
      },
      set: function(value) {
        if (value === 1 || value === 14) {
          theAceValue = value;
        }
      }
    });
  }

  function getRandomSuit() {
    return theSuits[Math.floor(Math.random() * theSuits.length)];
  }

  function getRandomValue() {
    return theValues[Math.ceil(Math.random() * (theValues.length - 1))];
  }
}

//let writable. configurable and enumerable default to private to lock object down
Object.defineProperties(Card.prototype, {
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
  compareTo: {
    value: function(otherCard) {
      if (otherCard instanceof Card) {
        return this.valueOf() - otherCard.valueOf();
      } else {
        throw new TypeError('Can\'t compare ' + otherCard + ' with a Card.');
      }
    },
  },
  clone: {
    value: function() {
      return new Card(this.value, this.suit);
    },
  },
  toJSON: {
    value: function() {
      return {
        suit: this.suit,
        value: this.value
      };
    },
  }
});

Object.defineProperties(Card, {
  suits: {
    get: function() {
      return ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'];
    },
    enumerable: true,
  },
  values: {
    get: function() {
      return ['JOKER', 'ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];
    },
    enumerable: true,
  },
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
