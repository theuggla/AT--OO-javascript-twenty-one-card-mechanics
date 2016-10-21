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
  let inPlay = [];
  let unused = joker ? Deck.createSet(Card.suits, Card.values) : Deck.createSet(Card.suits, Card.values.slice(1));

  Object.defineProperties(this, {
    unusedCards: {
      get: function() {
        return copyCards(unused);
      },
      set: function(cards) {
        if (areValidCards(cards)) {
          if (cards.length === 0) { //allow to be set to 0;
            unused = [];
          } else if (!(Deck.contains(inPlay, cards)) && !(Deck.contains(used, cards))) {
            unused = copyCards(cards);
          } else {
            throw new Error('These cards are already in the deck.');
          }
        }
      },
      enumerable: true,
      configurable: false
    },
    inPlay: {
        get: function() {
          return copyCards(inPlay);
        },
        set : function(cards) {
            if (areValidCards(cards)) {
              if (cards.length === 0) {
                inPlay = [];
              } else if (!(Deck.contains(unused, cards)) && (!Deck.contains(used, cards))) {
                inPlay = copyCards(cards);
              } else {
                throw new Error('These cards are already in the deck.');
              }
            }
          },
        enumerable: true,
        configurable: false
      },
    usedCards: {
      get: function() {
        return copyCards(used);
      },
      set: function(cards) {
        if (areValidCards(cards)) {
          if (cards.length === 0) { //allow to be set to 0
            used = [];
          } else if (!(Deck.contains(unused, cards)) && (!Deck.contains(inPlay, cards))) {
            used = copyCards(cards);
          } else {
            throw new Error('These cards are already in the deck.');
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
      let inPlay = this.inPlay;
      let theCard;
      if (theDeck.length === 0) {
        throw new Error('Deck is empty, cannot deal.');
      } else {
        theCard = theDeck.pop();
        inPlay.push(theCard);
        this.unusedCards = theDeck;
        this.inPlay = inPlay;
        return theCard.clone();
      }
    },
  },
  returnToDeck: {
    value: function(cards) {
      let used = this.usedCards;
      let inPlay = this.inPlay;
      if (Deck.contains(inPlay, cards)) {
        for (let j = 0; j < cards.length; j += 1) {
          let found;
          for (let i = 0; i < inPlay.length && !found; i++) {
            if (inPlay[i].equals(cards[j])) {
              used.push(inPlay[i]);
              inPlay.splice(i, i + 1);
              found = true;
            }
          }
        }
      } else {
        throw new Error('These cards do not belong in the deck.');
      }
      this.inPlay = inPlay;
      this.usedCards = used;
    },
  },
  reset: {
      value: function() {
          let unused = this.unusedCards;
          let inPlay = this.inPlay;
          let used = this.usedCards;

          while (inPlay.length > 0) {
            unused.push(inPlay.pop());
          }
          while (used.length > 0) {
            unused.push(used.pop());
          }

          this.inPlay = inPlay;
          this.usedCards = used;
          this.unusedCards = unused;

        }
    }
});

Object.defineProperties(Deck, {
  contains: {
    value: function(theDeck, card) {
      let indices;
      let cards;

      if (!Array.isArray(card)) {
        cards = [card.clone()];
      } else {
        cards = card;
      }

      for (let j = 0; j < cards.length; j += 1) {
        let found;
        for (let i = 0; i < theDeck.length && !found; i += 1) {
          if (theDeck[i].equals(cards[j])) {
            if (!indices) {
              indices = [];
            }
            indices.push(i);
            found = true;
          }
        }
      }
      return indices;
    }
  },
  findAll: {
    value: function(deck, type) {
      let theType;
      let values;
      let suits;

      if (Card.values.indexOf(type.toUpperCase()) !== -1) {
        values = [type];
        suits = Card.suits;
      } else if (Card.suits.indexOf(type.toUpperCase()) !== -1) {
        values = Card.values;
        suits = [type];
      } else {
        throw new TypeError('Cant\'t search for ' + type + ' in the deck.');
      }

      theType = Deck.createSet(suits, values);

      return Deck.contains(deck, theType);
    }
  },
  createSet: {
    value: function(suits, values) {
        let newSet = [];
        let theCard;
        suits.forEach(function(suit) {
          values.forEach(function(value) {
            try {
              theCard = new Card(value, suit);
            } catch (e) {
              throw new TypeError('Not a valid suit or value.');
            }
            newSet.push(theCard);
          });
        });
        return newSet;
      }
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

/**
 * Exports.
 */
module.exports = Deck;
