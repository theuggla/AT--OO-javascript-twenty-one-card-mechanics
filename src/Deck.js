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
                    } else if (areValidCards(cards) && (!Deck.contains(unused, cards))) { //the cards can't already be in the unused Array, we don't want two of the same card
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
        },
        length: {
            get: function() {
                return unused.length();
            }
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

    function areValidCards(cards) {
        cards.forEach(function(card) {
            if (!Card.isValid(card)) {
                return false;
            }
        });
        return true;
    }
}

Object.defineProperties(Deck.prototype, {
    equals: {
        value: function(other) {
            if (!(other instanceof Deck)) {
                return false;
            } else if (other.unusedCards !== this.unusedCards || other.usedCards !== this.usedCards) {
                return false;
            } else {
                let unused = this.unusedCards;
                let used = this.usedCards;
                let otherUnused = other.unusedCards;
                let otherUsed = other.usedCards;

                for (let i = 0; i < unused.length; i += 1) {
                    if (!unused[i].equals(otherUnused[i])) {
                        return false;
                    }
                }

                for (let i = 0; i < used.length; i += 1) {
                    if (!used[i].equals(otherUsed[i])) {
                        return false;
                    }
                }

                return true;
            }
        },
        writable: false,
        enumerable: false,
        configurable: false
    },
    clone: {
        value: function() {
            let copy = new Deck();

            copy.unusedCards = copyCards(this.unusedCards);
            copy.usedCards = copyCards(this.usedCards);

            return copy;
        }
    },
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

Object.defineProperties(Deck, {
    contains: {
        value: function(theDeck, cards) {
            if (theDeck.length === 0) {
                return false;
            } else {
                cards.forEach(function (card) {
                    theDeck.forEach(function (cardInDeck) {
                        if (card.equals(cardInDeck)) {
                            return true;
                        }
                    });
                });
            }
            return false;
        },
        writable: false,
        enumerable: false,
        configurable: false
    }
});

//helper functions
function copyCards(cards) {
    let theCopy = [];
    cards.forEach(function (card) {
        theCopy.push(card.clone());
    });
    return theCopy;
}

/**
 * Exports.
 */
module.exports = Deck;
