/**
 * Module for Board.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

let Player = require('../src/Player.js');
let Dealer = require('../src/Dealer.js');
let Deck = require('../src/Deck.js');

function Board() {
    let theDeck = new Deck();
    let theDealer = new Dealer();

    Object.defineProperties(this, {
        theDealer: {
            get: function() {
                return theDealer;
            },
            enumerable: true,
            configurable: false
        },
        theDeck: {
            get: function() {
                return theDeck;
            },
            enumerable: true,
            configurable: false
        }
    });
}

Board.prototype.playRound = function(thePlayer) {
    let theWinner;
    this.theDeck.shuffle();

    while (thePlayer.requestCard()) {
        let theCard = this.theDeck.deal();
        thePlayer.addToHand(theCard);
        if ((thePlayer.points === 21) || (thePlayer.hand.length === 5 && thePlayer.points < 21)) {
            theWinner = thePlayer;
            break;
        } else if (thePlayer.points > 21) {
            theWinner = this.theDealer;
            break;
        }
    }

    if (!theWinner) {
        while (this.theDealer.requestCard()) {
            this.theDealer.addToHand(this.theDeck.deal());
            if (this.theDealer.points >= thePlayer.points) {
                theWinner = this.theDealer;
                break;
            } else if (this.theDealer.points > 21) {
                theWinner = thePlayer;
                break;
            }
        }
    }

    return theWinner;
};

module.exports = Board;
