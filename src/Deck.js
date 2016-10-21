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
        if (areValidCards(cards)) {
          if (cards.length === 0) { //allow to be set to 0
            used = [];
          } else if (!Deck.contains(unused, cards)) { //the cards can't already be in the unused pile, we don't want two of the same card
            used = copyCards(cards);
          } else {
            throw new Error('Can\'t add these cards to the deck!');
          }
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
        if (areValidCards(cards)) {
          if (cards.length === 0) { //allow to be set to 0;
            unused = [];
          } else if (!Deck.contains(used, cards)) { //the cards can't already be in the used pile, we don't want two of the same card
            unused = copyCards(cards);
          } else {
            throw new Error('Can\'t add these cards to the deck!');
          }
        }
      },
      enumerable: true,
      configurable: false
    },
    length: {
      get: function() {
        return unused.length;
      }
    }
  });
}

//let writable, configurable and enumerable default to private to lock object down
Object.defineProperties(Deck.prototype, {
  equals: {
    value: function(other) {
      if (!(other instanceof Deck)) {
        return false;
      } else if (other.unusedCards.length !== this.unusedCards.length || other.usedCards.length !== this.usedCards.length) {
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
  },
  deal: {
    value: function() {
      let theDeck = this.unusedCards;
      if (theDeck.length === 0) {
        throw new Error('Deck is empty, cannot deal.');
      } else {
        let theCard = theDeck.pop();
        this.unusedCards = theDeck;
        return theCard;
      }
    },
  },
  returnToDeck: {
    value: function(cards) {
      let used = this.usedCards;
      cards.forEach(function(card) {
        used.push(card.clone());
      });
      this.usedCards = used;
    },
  }
});

Object.defineProperties(Deck, {
  contains: {
    value: function(theDeck, cards) {
      let result = false;
      if (areValidCards(theDeck) && areValidCards(cards)) {
        if (theDeck.length === 0) {
          return false;
        } else {
          cards.forEach(function(card) {
            theDeck.forEach(function(cardInDeck) {
              if (card.equals(cardInDeck)) {
                result = true;
                return result;
              }
            });
            if (result) {
              return result;
            }
          });
        }
        return result;
      }
    },
  }
});

//helper functions
function copyCards(cards) {
  let theCopy = [];
  if (areValidCards) {
    cards.forEach(function(card) {
      theCopy.push(card.clone());
    });
    return theCopy;
  }
}

function areValidCards(cards) {
  if (!Array.isArray(cards)) {
    throw new TypeError('Argument not an Array');
  } else {
    cards.forEach(function(card) {
      if (!Card.isValid(card)) {
        throw new TypeError(card + ' is not a valid card!');
      }
    });
    return true;
  }
}

function createDeck(joker) {
  let newDeck = [];
  let suits = Card.suits;
  let values = Card.values;
  suits.forEach(function(suit) {
    values.forEach(function(value) {
      if (!joker) {
        if (value !== 'JOKER') {
          newDeck.push(new Card(value, suit));
        }
      } else {
        newDeck.push(new Card(value, suit));
      }
    });
  });
  return newDeck;
}

/**
 * Exports.
 */
module.exports = Deck;
