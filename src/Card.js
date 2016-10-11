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

    Object.defineProperties(this, {
        suit: {
            get: getSuit,
            set: setSuit,
            enumerable: true,
            configurable: false
        },
        value: {
            get: getValue,
            set: setValue,
            enumerable: true,
            configurable: false
        }
    });

    function getSuit() {
        return theSuit;
    }

    function setSuit(suit) {
        if (!theSuit) { //only set the suit if it hasn't already been set
            if (!suit) {
                theSuit = getRandomSuit();
            } else if (theSuits.indexOf(suit.toUpperCase()) !== -1) {
                theSuit = suit.toUpperCase();
            } else {
                throw new Error(suit + ' is not a valid suit.');
            }
        } else {
            throw new Error('Can\'t change existing suit.');
        }
    }

    function getValue() {
        return theValue;
    }

    function setValue(value) {
        if (!theValue) { //only set the value if it hasn't already been set
            if (!value) {
                theValue = getRandomValue();
            } else if (theValues.indexOf(value.toUpperCase()) !== -1) {
                theValue = value.toUpperCase();
            } else {
                throw new Error(value + ' is not a valid value.');
            }
        } else {
            throw new Error('Can\'t change existing value.');
        }
    }

    this.suit = suit;
    this.value = value;

    function getRandomSuit() {
        return theSuits[Math.floor(Math.random() * theSuits.length)];
    }

    function getRandomValue() {
        return value = theValues[Math.ceil(Math.random() * (theValues.length - 1))];
    }
}

Card.prototype.valueOf = function() {
     return Card.values.indexOf(this.value);
 };

Card.prototype.toString = function() {
    let output = '';
    if (this.value === 'JOKER') {
        output = this.value;
    } else {
        switch (this.suit) {
            case 'HEARTS':
                output += 'H';
                break;
            case 'SPADES':
                output += 'S';
                break;
            case 'CLUBS':
                output += 'C';
                break;
            case 'DIAMONDS':
                output += 'D';
                break;
        }
        output += values.indexOf(this.value);
    }

    return output;
};

Card.prototype.equals = function(other) {
    if (typeof other !== 'object') {
        return false;
    } else if (other !== other) {
        return false;
    } else if (other instanceof Card) {
        return (other.suit === this.suit && other.value === this.value);
    } else {
        return false;
    }
};

Card.prototype.compareTo = function(otherCard) {
    if (otherCard instanceof Card) {
        return Card.values().indexOf(this.value) - Card.values.indexOf(otherCard.value);
    } else {
        throw new TypeError('Can\'t compare ' + otherCard + ' with a Card.');
    }
};

Card.prototype.toJSON = function() {
    return {
        suit: this.suit,
        value: this.value
    };
};

Card.prototype.clone = function() {
    return new Card(this.suit, this.value);
};

Object.defineProperties(Card, {
    suits: {
        get: function() {return ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'];},
        enumerable: false,
        configurable: false
    },
    values: {
        get: function() {return ['JOKER', 'ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];},
        enumerable: false,
        configurable: false
    },
    isValid: {
        value: function(card) {
            if (!(card instanceof Card)) {
                return false;
            } else if (!card.suit || !card.value) {
                return false;
            } else if (Card.getSuits().indexOf(card.suit) === -1 || Card.getValues().indexOf(card.value) === -1) {
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
