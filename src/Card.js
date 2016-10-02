/**
 * Module for ToDoItem.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

class Card {
    constructor(suit = getRandomSuit(), value = getRandomValue()) {
        let theSuit = undefined;
        let theValue = undefined;

        let theSuits = ['HEARTS', 'SPADES', 'CLUBS', 'DIAMONDS'];
        let theValues = ['JOKER, ACE, TWO, THREE, FOUR, FIVE, SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];

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
                if (theSuits.indexOf(suit.toUpperCase()) !== -1) {
                    theSuit = suit;
                }
                else {
                    throw new Error(suit + ' is not a valid suit.');
                }
            }
        }
        function getValue() {
            return theValue;
        }
        function setValue(value) {
            if (!theValue) { //only set the value if it hasn't already been set
                if (theValues.indexOf(value.toUpperCase()) !== -1) {
                    theValue = value;
                }
                else {
                    throw new Error(value + ' is not a valid value.');
                }
            }
        }

        function getRandomSuit() {}
        function getRandomValue() {}
    }

    valueOf() {

    }

    toString() {

    }

    equals() {

    }

    compareTo() {

    }

    toJson() {

    }
}
