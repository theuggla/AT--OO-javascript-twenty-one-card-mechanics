/**
 * Module for Card.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

function Card(suit, value) {

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
            configurable: false
        },
        value: {
            get: function() {
                return theValue;
            },
            enumerable: true,
            configurable: false
        }
    });

    function getRandomSuit() {
        return theSuits[Math.floor(Math.random() * theSuits.length)];
    }

    function getRandomValue() {
        return theValues[Math.ceil(Math.random() * (theValues.length - 1))];
    }
}

Object.defineProperties(Card.prototype, {
    valueOf: {
        value: function() {
            if (this.value === 'JOKER') {
                return -1;
            } else {
                return Card.values.indexOf(this.value);
            }
        },
        writable: false,
        enumerable: false,
        configurable: false
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
                output += Card.values.indexOf(this.value);
            }

            return output;
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    equals: {
        value: function(other) {
            if (typeof other !== 'object') {
                return false;
            } else if (other !== other) {
                return false;
            } else if (other instanceof Card) {
                return (other.suit === this.suit && other.value === this.value);
            } else {
                return false;
            }
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    compareTo: {
        value: function(otherCard) {
            if (otherCard instanceof Card) {
                return this.valueOf() - otherCard.valueOf();
            } else {
                throw new TypeError('Can\'t compare ' + otherCard + ' with a Card.');
            }
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    clone: {
        value: function() {
            return new Card(this.suit, this.value);
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    toJSON: {
        value: function() {
            return {
                suit: this.suit,
                value: this.value
            };
        },
        writable: false,
        enumerable: false,
        configurable: false
    }
});

Object.defineProperties(Card, {
    suits: {
        get: function () {
            return ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'];
        },
        enumerable: false,
        configurable: false
    },
    values: {
        get: function () {
            return ['JOKER', 'ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];
        },
        enumerable: false,
        configurable: false
    },
    isValid: {
        value: function (card) {
            if (!(card instanceof Card)) {
                return false;
            } else if (!card.suit || !card.value) {
                return false;
            } else if (Card.suits.indexOf(card.suit) === -1 || Card.values.indexOf(card.value) === -1) {
                return false;
            }
            return true;
        },
        writable: false,
        enumerable: false,
        configurable: false
    }
});

/**
 *  Exports.
 */
module.exports = Card;
