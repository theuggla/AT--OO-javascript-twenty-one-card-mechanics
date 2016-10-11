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

    let theSuits = Card.getSuits();
    let theValues = Card.getValues();

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
        let suit = theSuits[Math.floor(Math.random() * theSuits.length)];
        return suit;
    }
    function getRandomValue() {
        let value = theValues[Math.floor(Math.random() * theValues.length + 1)];
        return value;
    }
}
 Card.prototype.valueOf = function() {
     return Card.getValues().indexOf(this.value);
 };

Card.prototype.toString = function() {
    let output = '';
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
    output += Card.getValues().indexOf(this.value);
    return output;
};

Card.prototype.equals = function(otherCard) {
    if (typeof otherCard !== 'object') {
        return false;
    } else if (otherCard !== otherCard) {
        return false;
    } else if (otherCard instanceof Card) {
        return (otherCard.suit === this.suit) && otherCard.value === this.value;
    } else {
        return false;
    }
};

Card.prototype.compareTo = function(otherCard) {
    if (otherCard instanceof Card) {
        return Card.getValues().indexOf(this.value) - Card.getValues().indexOf(otherCard.value);
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

Card.getSuits = function() {
    return ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'];
};

Card.getValues = function() {
    return ['JOKER', 'ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];
};

Card.isValid = function(card) {
    if (!(card instanceof Card))  {
        return false;
    } else if (!card.suit || !card.value) {
        return false;
    } else if (Card.getSuits().indexOf(card.suit) === -1 || Card.getValues().indexOf(card.value) === -1) {
        return false;
    }
    return true;
};

/**
 *  Exports.
 */
module.exports = Card;
