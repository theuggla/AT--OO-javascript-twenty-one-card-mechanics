/**
 * Module for Player.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');

function Player(name = 'a Player') {

    let theName;
    let theHand = [];
    const LIMIT = 15;

    Object.defineProperties(this, {
        name: {
            get: function() {
                return theName;
            },
            set: function(name) {
                if (name.length > 0 && name.length < 20) {
                    theName = name;
                }
            },
            enumerable: true,
            configurable: false
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
            configurable: false
        },
        inPlay: {
            get: function() {
                return this.valueOf() < 21;
            },
            enumerable: false,
            configurable: false
        },
        limit: {
            get: function() {
                return LIMIT;
            },
            enumerable: true,
            configurable: false
        },
        points: {
            get: function() {
                return this.valueOf();
            },
            enumerable: true,
            configurable:false,
        }
    });

    this.name = name;

    //helper functions
    function copyHand(hand) {
        let newHand = [];
        hand.forEach(function(card) {
            newHand.push(card.clone());
        });
        return newHand;
    }

    function isValidHand(hand) {
        hand.forEach(function(card) {
            if (!Card.isValid(card)) {
                return false;
            }
        });
        return true;
    }
}

Object.defineProperties(Player.prototype, {
    valueOf: {
        value: function() {
            return this.hand.reduce(function(a, b) {
                return a + b;
            }, 0);
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    toString: {
        value: function() {
            let output = this.name + ' ';
            this.hand.forEach(function(card) {
                output += card.toString() + ' ';
            });
            return output;
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    requestCard: {
        value: function() {
            if (this.inPlay) {
                return this.valueOf() < this.limit;
            }
            return false;
        },
        writable: true,
        enumerable: false,
        configurable: false
    },
    addToHand: {
        value: function(card) {
            let theHand = this.hand;
            if (Card.isValid(card)) {
                theHand.push(card.clone());
            }
            this.hand = theHand;
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    reset: {
        value: function() {
            let theHand = this.hand;
            this.hand = [];
            return theHand;
        },
        writable: false,
        enumerable: false,
        configurable: false
    }
});

/*
* Exports.
*/
module.exports = Player;


