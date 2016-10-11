/**
 * Module for Deck.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');

function Deck() {
    let used = [];
    let unused = [];

    Object.defineProperties(this, {
        usedCards: {
            get: getUsedCards,
            set: setUsedCards
        },
        unusedCards: {
            get: getUnusedCards,
            set: setUnusedCards
        }
    });

    function getUnusedCards() {
        return copyCards(unused);
    }

    function setUnusedCards(cards) {
        if (Array.isArray(cards)) {
            if (cards.length === 0) { //allow to be set to 0;
                unused = [];
            } else if (areValidCards(cards) && (!contains(used, cards))) { //the cards can't already be in the used Array, we don't want two of the same card
                unused = copyCards(cards);
            } else {
                throw new Error('Can\'t add these cards to the deck!');
            }
        } else {
            throw new TypeError('Must be Array!');
        }
    }

    function getUsedCards() {
        return copyCards(used);
    }

    function setUsedCards(Cards) {
        if (Array.isArray(Cards)) {
            if (Cards.length === 0) { //allow to be set to 0
                used = [];
            } else if (areValidCards(Cards) && (!contains(unused, Cards))) { //the cards can't already be in the unused Array, we don't want two of the same card
                used = copyCards(Cards);
            } else {
                throw new Error('Can\'t add these cards to the deck!');
            }
        } else {
            throw new TypeError('Must be Array!');
        }
    }

    this.unusedCards = createDeck();

    function copyCards(cards) {
        let theCopy = [];
        cards.forEach(function(card) {
            theCopy.push(card.clone());
        });
        return theCopy;
    }

    function areValidCards(cards) {
        cards.forEach(function(card) {
            if (!Card.isValid(card)) {
                console.log('it\'s me, ' + card.toString());
                return false;
            }
        });
        return true;
    }

    function contains(theDeck, cards) {
        if (theDeck.length === 0) {
            return false;
        } else {
            cards.forEach(function(card) {
                theDeck.forEach(function(cardInDeck) {
                    if (card.equals(cardInDeck)) {
                        return true;
                    }
                });
            });
        }
        return false;
    }

    function createDeck() {
        let newDeck = [];
        let suits = Card.getSuits();
        let values = Card.getValues();
        suits.forEach(function(suit) {
            values.forEach(function(value) {
                if (value !== 'JOKER') {
                    newDeck.push(new Card(suit, value));
                }
            });
        });
        return newDeck;
    }

}

Deck.prototype.toString = function() {
    let output = '';
    this.unusedCards.forEach(function(card) {
        output += ' ' + card.toString();
    });
    return output;
};

Deck.prototype.reshuffle = function() {
    let newDeck = [];
    newDeck = this.unusedCards;
    this.usedCards.forEach(function(card) {
        newDeck.push(card);
    });
    this.usedCards = [];
    this.unusedCards = newDeck;
    this.shuffle();
};

Deck.prototype.shuffle = function() {
    let theDeck = this.unusedCards;
    for (let i = (theDeck.length - 1); i > 0; i -= 1) {
        let j = Math.floor(Math.random() * i);
        let iOld = theDeck[i];
        theDeck[i] = theDeck[j];
        theDeck[j] = iOld;
    }
    this.unusedCards = theDeck;
};

Deck.prototype.deal = function() {
    let theDeck = this.unusedCards;
    let theCard = theDeck.pop();
    if (theDeck.length === 1) {
        this.reshuffle();
    } else {
        this.unusedCards = theDeck;
    }
    return theCard;
};

Deck.prototype.returnToDeck = function(cards) {
    let used = this.usedCards;
    cards.forEach(function(card) {
        used.push(card); //no need to copy the card as it's handled in the setter
    });
    this.usedCards = used;
};

/**
 * Exports.
 */
module.exports = Deck;
