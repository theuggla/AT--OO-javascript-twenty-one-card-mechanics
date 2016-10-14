/**
 * Module for BlackJackPlayer.
 * @augments CardPlayer
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');
const CardPlayer = require('../src/CardPlayer.js');

function BlackJackPlayer(name = 'a Blackjack player') {
    CardPlayer.call(this, name);

    const LIMIT = 12;
    this.BET = 10;
    let bank = 100;

    Object.defineProperties(this, {
        limit: {
            get: function() {
                return LIMIT;
            },
            enumerable: true,
            configurable: false,
        },
        inPlay: {
            get: function() {
                return this.points < 21;
            },
            enumerable: false,
            configurable: false
        },
        bank: {
            get: function() {
                return bank;
            },
            set: function(value) {
                bank = value;
            },
            enumerable: true,
            configurable: false
        }
    });
}

BlackJackPlayer.prototype = Object.create(CardPlayer.prototype);

Object.defineProperties(BlackJackPlayer.prototype, {
    constructor: {
        value: BlackJackPlayer
    },
    requestCard: {
        value: function() {
            if (this.inPlay) {
                return this.points < this.limit;
            }
            return false;
        },
        writable: true,
        enumerable: false,
        configurable: false
    },
    makeBet: {
        value: function() {
            let bet;
            if ((this.bank - this.BET) >= 0) {
                bet = this.BET;
            } else {
                bet = this.bank;
            }
            this.bank = this.bank - bet;
            return bet;
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    toString: {
        value: function() {
            let output = this.name + ' (£' + this.bank + '): ';
            this.hand.forEach(function(card) {
                output += card.toString() + ' ';
            });
            output += '(' + this.points + ')';
            if (this.points > 21) {
                output += ' BUSTED!';
            }
            return output;
        }
    }
});


module.exports = BlackJackPlayer;
