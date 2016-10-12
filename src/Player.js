/**
 * Module for Player.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

function Player(name = 'aPlayer') {
    let theName;
    let hand = [];

    Object.defineProperties(this, {
        name: {
            get: getName,
            set: setName,
            enumerable: true,
            configurable: true
        },
        hand: {
            get: setHand,
            set: getHand,
            enumerable: true,
            configurable: true
        },
        inPlay: {
            get: function() {

            },
            enumerable: false,
            configurable: true
        }
    });

    function getHand() {

    }
    function setHand() {

    }
    function getName() {

    }
    function setName() {

    }
}

Player.prototype.valueOf = function() {

};

Player.prototype.toString = function() {

};

Player.prototype.requestCard = function() {

};


