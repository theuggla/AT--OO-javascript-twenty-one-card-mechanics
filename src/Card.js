/**
 * Module for ToDoItem.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

class Card {
    constructor(suit, value) {
        let theSuit;
        let theValue;

        Card.prototype.defineProperties(this, {
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
                if (Card.getSuits.indexOf(suit.toUpperCase()) !== -1) {
                    theSuit = suit;
                }
                else if (!suit) {
                    theSuit = getRandomSuit();
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
                if (Card.getValues.indexOf(value.toUpperCase()) !== -1) {
                    theValue = value;
                }
                else if (!value) {
                    theValue = getRandomValue();
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
            let suit = Card.getSuits()[Math.random() * Card.getSuits.length];
            return suit;
        }

        function getRandomValue() {
            let value = Card.getValues()[Math.random() * Card.getValues.length];
            return value;
        }
    }

    getSuits() {
        return ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'];
    }

    getValues() {
        return ['JOKER', 'ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];
    }

    valueOf() {
        return Card.getValues().indexOf(this.value);
    }

    toString() {
        let output;
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
    }

    equals(otherCard) {
        if (typeof otherCard !== 'object') {
            return false;
        } else if (otherCard !== otherCard) {
            return false;
        } else if (otherCard instanceof Card) {
            return (otherCard.suit === this.suit) && otherCard.value === this.value;
        } else {
            return false;
        }
    }

    compareTo(otherCard) {
        if (otherCard instanceof Card) {
            return this.value - otherCard.value;
        } else {
            throw new TypeError('Can\'t compare ' + otherCard + ' with a Card.');
        }
    }

    toJson() {
        let aSuit = this.suit;
        let aValue = this.value;
        let jsonobject = {
            suit: aSuit,
            value: aValue
        };
        return JSON.stringify(jsonobject);
    }
}
