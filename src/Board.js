/**
 * Module for Board.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

let Player = require('../src/BlackjackPlayer.js');
let Dealer = require('../src/Dealer.js');
let Deck = require('../src/Deck.js');

function Board(players) {
    let theDeck = new Deck();
    let theDealer = new Dealer();
    let history;

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
        },
        history: {
            value: history,
            writable: true,
            enumerable: true,
            configurable: false
        }
    });

    theDeck.shuffle();
}

Board.prototype.playRound = function(thePlayer) {
    let theWinner;
    let bet = thePlayer.makeBet();
    this.theDeck.shuffle();

    while (thePlayer.requestCard()) {
        let theCard = this.theDeck.deal();
        thePlayer.addToHand(theCard);
        if ((thePlayer.points === 21) || (thePlayer.hand.length === 5 && thePlayer.points < 21)) {
            theWinner = thePlayer.name;
            thePlayer.bank = thePlayer.bank + (bet * 2);
            break;
        } else if (thePlayer.points > 21) {
            theWinner = this.theDealer.name;
            break;
        }
    }

    if (!theWinner) {
        while (this.theDealer.requestCard()) {
            if (this.theDeck.length === 1) {
                this.theDeck.reshuffle();
            }
            this.theDealer.addToHand(this.theDeck.deal());
            if (this.theDealer.points > 21) {
                theWinner = thePlayer.name;
                thePlayer.bank = thePlayer.bank + (bet * 2);
                break;
            } else if (this.theDealer.points >= thePlayer.points) {
                theWinner = this.theDealer.name;
                break;
            }
        }
    }

    this.history = theWinner + ' wins!' + '\n' +
        'PLAYER: ' + thePlayer.toString() + '\n' +
        'DEALER: ' + this.theDealer.toString() + '\n';


    this.theDeck.returnToDeck(this.theDealer.hand);
    this.theDeck.returnToDeck(thePlayer.hand);
    thePlayer.hand = [];
    this.theDealer.hand = [];

};

Board.prototype.toString = function() {
    return this.history;
};

Board.prototype.reset = function() {
    this.theDeck.returnToDeck(this.theDealer.hand);
    this.theDeck.returnToDeck(this.thePlayer.hand);
    this.thePlayer.hand = [];
    this.theDealer.hand = [];
    console.log(this.thePlayer.toString());
    console.log(this.theDealer.toString());
};

module.exports = Board;
