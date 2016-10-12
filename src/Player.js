/**
 * Module for Player.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');

function Player(name) {

    let theName;
    let theHand = [];

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

Player.prototype.valueOf = function() {
    this.hand.reduce(function(a, b) {
        return a + b;
    });
};

Player.prototype.toString = function() {
    let output = this.name + ' ';
    this.hand.forEach(function(card) {
        output += card.toString() + ' ';
    });
    return output;
};

Player.prototype.requestCard = function() {
    if (this.inPlay) {
        return this.valueOf() < 15;
    }
    return false;
};

Player.prototype.addToHand = function(card) {
    let theHand = this.hand;
    if (Card.isValid(card)) {
        theHand.push(card.clone());
    }
    this.hand = theHand;
};

Player.prototype.reset = function() {
    this.hand = [];
};

/*
* Exports.
*/
module.exports = Player;


