/**
 * Module for ToDoItem.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

class Card {
    constructor(suit = getRandomSuit(), value = getRandomValue()) {
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

        function getSuit() {}
        function setSuit(suit) {}
        function getValue() {}
        function setValue(value) {}

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
