/**
 * Module for Deck.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');

function Deck(joker) {
    let used = [];
    let unused = createDeck(joker);

    Object.defineProperties(this, {
        usedCards: {
            get: function() {
                return copyCards(used);
            },
            set: function(cards) {
                if (Array.isArray(cards)) {
                    if (cards.length === 0) { //allow to be set to 0
                        used = [];
                    } else if (areValidCards(cards) && (!contains(unused, cards))) { //the cards can't already be in the unused Array, we don't want two of the same card
                        used = copyCards(cards);
                    } else {
                        throw new Error('Can\'t add these cards to the deck!');
                    }
                } else {
                    throw new TypeError('Must be Array!');
                }
            },
            enumerable: true,
            configurable: false
        },
        unusedCards: {
            get: function() {
                return copyCards(unused);
            },
            set: function(cards) {
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
            },
            enumerable: true,
            configurable: false
        }
    });

    //helper functions
    function createDeck(joker) {
        let newDeck = [];
        let suits = Card.suits;
        let values = Card.values;
        suits.forEach(function(suit) {
            values.forEach(function(value) {
                if(!joker) {
                    if (value !== 'JOKER') {
                        newDeck.push(new Card(suit, value));
                    }
                } else {
                    newDeck.push(new Card(suit, value));
                }
            });
        });
        return newDeck;
    }

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
}

Object.defineProperties(Deck.prototype, {
    toString: {
        value: function() {
            let output = '';
            this.unusedCards.forEach(function(card) {
                output += ' ' + card.toString();
            });
            return output;
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    shuffle: {
        value: function() {
            let theDeck = this.unusedCards;
            for (let i = (theDeck.length - 1); i > 0; i -= 1) {
                let j = Math.floor(Math.random() * i);
                let iOld = theDeck[i];
                theDeck[i] = theDeck[j];
                theDeck[j] = iOld;
            }
            this.unusedCards = theDeck;
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    reshuffle: {
        value: function() {
            let newDeck = [];
            newDeck = this.unusedCards;
            this.usedCards.forEach(function(card) {
                newDeck.push(card);
            });
            this.usedCards = [];
            this.unusedCards = newDeck;
            this.shuffle();
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    deal: {
        value: function() {
            let theDeck = this.unusedCards;
            let theCard = theDeck.pop();
            if (theDeck.length === 1) {
                this.reshuffle();
            } else {
                this.unusedCards = theDeck;
            }
            return theCard;
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    returnToDeck: {
        value: function(cards) {
            let used = this.usedCards;
            cards.forEach(function(card) {
                used.push(card.clone());
            });
            this.usedCards = used;
        },
        writable: false,
        enumerable: false,
        configurable: false
    }
});

/**
 * Exports.
 */
module.exports = Deck;
