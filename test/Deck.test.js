/**
 * Tests for the Deck type.
 *
 * @author Mats Molly Arhammar
 * @version 1.16.1
 */

'use strict';

const expect = require('chai').expect;

describe('Deck', () => {
  const Card = require('../src/Card');
  const CARD = new Card('TEN', 'HEARTS');
  const JOKER = 'JOKER';

  let Deck;

  describe('Type', () => {
    it('should be defined', (done) => {
      Deck = require('../src/Deck');
      done();
    });
  });

  describe('Constructor', () => {
    let deck;

    beforeEach(() => {
      // Create a new Deck before every test.
      deck = new Deck();
    });

    it('should be instance of Deck', (done) => {
      expect(deck).to.be.an.instanceOf(Deck);
      done();
    });

    it('should have property usedCards', (done) => {
      expect(deck).to.have.property('usedCards');
      done();
    });

    it('should have property unusedCards', (done) => {
      expect(deck).to.have.property('unusedCards');
      done();
    });
  });

  describe('Properties', () => {
    describe('unusedCards', () => {
      let deck;

      beforeEach(() => {
        // Create a new Deck before every test.
        deck = new Deck();
      });

      it('should start out as 52', (done) => {
        expect(deck.unusedCards.length).to.equal(52);
        done();
      });

      it('should be able to be changed to an Array of Cards or to an empty Array', (done) => {
        deck.unusedCards = [CARD];
        expect(deck.unusedCards).to.deep.equal([CARD]);
        deck.unusedCards = [];
        expect(deck.unusedCards).to.deep.equal([]);
        done();
      });

      it('should throw a TypeError if unusedCards is set to a non-array value', (done) => {
        expect(() => {
          deck.unusedCards = undefined;
        }).to.throw(TypeError);
        expect(() => {
          deck.unusedCards = null;
        }).to.throw(TypeError);
        expect(() => {
          deck.unusedCards = 42;
        }).to.throw(TypeError);
        expect(() => {
          deck.unusedCards = {};
        }).to.throw(TypeError);
        expect(() => {
          deck.unusedCards = CARD;
        }).to.throw(TypeError);
        done();
      });

      it('should throw an Error when if set to an invalid Card Array', (done) => {
        expect(() => {
          deck.unusedCards = [{Suit: 'HEJ', Value: 'HEJ'}];
        }).to.throw(Error);
        done();
      });

      it('should throw an Error if set to a Card that\'s already in the Deck', (done) => {
        expect(() => {
          deck.usedCards = [CARD];
          deck.unusedCards = [CARD];
        }).to.throw(Error);
        done();
      });
    });

    describe('usedCards', () => {
      let deck;

      beforeEach(() => {
        // Create a new Deck before every test.
        deck = new Deck();
      });

      it('should start out as 0', (done) => {
        expect(deck.usedCards.length).to.equal(0);
        done();
      });

      it('should be able to be changed to an Array of Cards or to an empty Array', (done) => {
        deck.unusedCards = [new Card('two', 'spades')];
        deck.usedCards = [CARD];
        expect(deck.usedCards).to.deep.equal([CARD]);
        deck.usedCards = [];
        expect(deck.usedCards).to.deep.equal([]);
        done();
      });

      it('should throw a TypeError if usedCards is set to a non-array value', (done) => {
        expect(() => {
          deck.usedCards = undefined;
        }).to.throw(TypeError);
        expect(() => {
          deck.usedCards = null;
        }).to.throw(TypeError);
        expect(() => {
          deck.usedCards = 42;
        }).to.throw(TypeError);
        expect(() => {
          deck.usedCards = {};
        }).to.throw(TypeError);
        expect(() => {
          deck.usedCards = CARD;
        }).to.throw(TypeError);
        done();
      });

      it('should throw an Error when if set to an invalid Card Array', (done) => {
        expect(() => {
          deck.usedCards = [{Suit: 'HEJ', Value: 'HEJ'}];
        }).to.throw(Error);
        done();
      });

      it('should throw an Error if set to a Card that\'s already in the Deck', (done) => {
        expect(() => {
          deck.unusedCards = [CARD];
          deck.usedCards = [CARD];
        }).to.throw(Error);
        done();
      });
    });

    describe('length', () => {
      let deck;

      beforeEach(() => {
        // Create a new Deck before every test.
        deck = new Deck();
      });

      it('should return the length of the unusedCards Array', (done) => {
        expect(deck.length).to.equal(52);
        deck.unusedCards = [CARD];
        expect(deck.length).to.equal(1);
        done();
      });

      it('should throw an Error if the length tries to be changed (read only)', (done) => {
        expect(() => {
          deck.length = 0;
        }).to.throw(Error);
        done();
      });
    });
  });

  describe('Prototype methods', () => {
    let deck;

    beforeEach(() => {
      // Create a new Deck before every test.
      deck = new Deck();
    });

    describe('equals method', () => {
      it('should be defined', (done) => {
        expect(Deck.prototype).to.have.property('equals').that.is.a('Function');
        done();
      });

      it('should return true', (done) => {
        let anotherDeck = new Deck();
        expect(deck.equals(anotherDeck)).to.equal(true);
        let jokerDeck = new Deck(JOKER);
        let anotherJokerDeck = new Deck(JOKER);
        expect(jokerDeck.equals(anotherJokerDeck)).to.equal(true);
        done();
      });

      it('should return false', (done) => {
        let anotherDeck = new Deck(JOKER);
        expect(deck.equals(anotherDeck)).to.equal(false);
        expect(deck.equals({})).to.equal(false);
        expect(deck.equals([])).to.equal(false);
        expect(deck.equals(42)).to.equal(false);
        expect(deck.equals('Hej')).to.equal(false);
        expect(deck.equals(false)).to.equal(false);
        expect(deck.equals(null)).to.equal(false);
        expect(deck.equals(undefined)).to.equal(false);
        done();
      });
    });

    describe('clone method', () => {
      it('should be defined', (done) => {
        expect(Deck.prototype).to.have.property('clone').that.is.a('Function');
        done();
      });

      it('should return a Dekc object', (done) => {
        expect(deck.clone()).to.be.an.instanceof(Deck);
        done();
      });

      it('should return a copy', (done) => {
        expect(deck.clone()).to.not.equal(deck);
        expect(deck.clone()).to.deep.equal(deck);
        done();
      });
    });

    describe('toString method', () => {
      it('should be defined', (done) => {
        expect(Deck.prototype).to.have.ownProperty('toString');
        expect(Deck.prototype).to.have.property('toString').that.is.a('Function');
        done();
      });

      it('should return a string', (done) => {
        expect(deck.toString()).to.be.a('string');
        done();
      });

      it('should return valid string when there are no unused cards', (done) => {
        deck.unusedCards = [];
        expect(deck.toString()).to.equal('');
        done();
      });
    });

    describe('shuffle method', () => {
      it('should be defined', (done) => {
        expect(Deck.prototype).to.have.property('shuffle').that.is.a('Function');
        done();
      });

      it('should shuffle the cards', (done) => {
        let anotherDeck = new Deck();
        expect(deck).to.deep.equal(anotherDeck);
        deck.shuffle();
        expect(deck).to.not.deep.equal(anotherDeck);
        done();
      });
      it('should leave the used cards alone', (done) => {
        let anotherDeck = new Deck();
        deck.unusedCards = [];
        deck.usedCards = anotherDeck.unusedCards;
        deck.shuffle();
        expect(deck.usedCards).to.deep.equal(anotherDeck.unusedCards);
        done();
      });

    });

    describe('reshuffle method', () => {
      it('should be defined', (done) => {
        expect(Deck.prototype).to.have.property('reshuffle').that.is.a('Function');
        done();
      });

      it('should shuffle the deck if there are no cards in the used pile', (done) => {
        let anotherDeck = new Deck();
        expect(deck).to.deep.equal(anotherDeck);
        deck.shuffle();
        expect(deck).to.not.deep.equal(anotherDeck);
        done();
      });
      it('should empty the used pile and add them to the unused pile', (done) => {
        deck.unusedCards = [CARD];
        deck.usedCards = [new Card('TEN', 'SPADES')];
        deck.reshuffle();
        expect(deck.usedCards.length).to.equal(0);
        expect(deck.unusedCards.length).to.equal(2);
        done();
      });
    });

    describe('deal method', () => {
      it('should be defined', (done) => {
        expect(Deck.prototype).to.have.property('deal').that.is.a('Function');
        done();
      });

      it('should return a card', (done) => {
        expect(deck.deal()).to.be.instanceof(Card);
        done();
      });

      it('should return the top card in the unused pile', (done) => {
        let topCard = deck.unusedCards[51];
        expect(deck.deal()).to.deep.equal(topCard);
        done();
      });

      it('should remove the card from the unused pile', (done) => {
        deck.deal();
        expect(deck.length).to.equal(51);
        done();
      });

      it('should throw an Error if there are no more cards in the unused pile', (done) => {
        expect(() => {
          deck.unusedCards = [];
          deck.deal();
        }).to.throw(Error);
        done();
      });
    });

    describe('returnToDeck method', () => {
      it('should be defined', (done) => {
        expect(Deck.prototype).to.have.property('returnToDeck').that.is.a('Function');
        done();
      });

      it('should return the cards to the used pile', (done) => {
        deck.unusedCards = [new Card('two', 'spades')];
        deck.inPlay = [CARD];
        deck.returnToDeck([CARD]);
        expect(deck.usedCards).to.deep.equal([CARD]);
        done();
      });

      it('should remove the cards from the inPlay pile', (done) => {
        deck.unusedCards = [new Card('two', 'spades')];
        deck.inPlay = [CARD];
        deck.returnToDeck([CARD]);
        expect(deck.usedCards).to.deep.equal([CARD]);
        expect(deck.inPlay.length).to.equal(0);
        done();
      });

      it('should not be privacy leakish', (done) => {
        deck.unusedCards = [new Card('two', 'spades')];
          deck.inPlay = [CARD];
        deck.returnToDeck([CARD]);
        expect(deck.usedCards).to.not.equal([CARD]);
        done();
      });
    });
  });
  describe('Static methods', () => {
    let deck;

    let cards = [];
    for (let i = 0; i < 5; i += 1) {
      cards[i] = new Card();
    }

    beforeEach(() => {
      // Create a new Deck before every test.
      deck = new Deck();
    });

    describe('contains method', () => {
      it('should be defined', (done) => {
        expect(Deck).to.have.property('contains').that.is.a('Function');
        done();
      });
      it('should return an array of indices', (done) => {
        expect(Array.isArray(Deck.contains(deck.unusedCards, [CARD]))).to.equal(true);
        expect(Array.isArray(Deck.contains(deck.unusedCards, cards))).to.equal(true);
        cards.push(CARD);
        expect(Array.isArray(Deck.contains(cards, [CARD]))).to.equal(true);
        done();
      });
      it('should return undefined', (done) => {
        expect(Deck.contains(deck.usedCards, [CARD])).to.equal(undefined);
        deck.unusedCards = [CARD];
        expect(Deck.contains(deck.unusedCards, [new Card('TWO', 'SPADES')])).to.equal(undefined);
        done();
      });
      it('should throw a TypeError if called with something that\'s not cards', (done) => {
        expect(() => {
          Deck.contains(deck.unusedCards, 42);
        }).to.throw(Error);
        done();
      });
    });
    describe('findAll method', () => {
      it('should be defined', (done) => {
        expect(Deck).to.have.property('findAll').that.is.a('Function');
        done();
      });
      it('should return an array of indices when card(s) are found', (done) => {
        expect(Deck.findAll(deck.unusedCards, 'two').length).to.equal(4);
        done();
      });
      it('should return undefined when deck does not contain card(s)', (done) => {
        deck.unusedCards = [CARD];
        expect(Deck.findAll(deck.unusedCards, 'ace')).to.equal(undefined);
        done();
      });
      it('should throw a TypeError if called with something that\'s not cards', (done) => {
        expect(() => {
          Deck.findAll(deck, ['monkey']);
        }).to.throw(TypeError);
        done();
      });
    });
    describe('createSet method', () => {
      it('should be defined', (done) => {
        expect(Deck).to.have.property('createSet').that.is.a('Function');
        done();
      });
      it('should return an array of Cards', (done) => {
        expect(Array.isArray(Deck.createSet(['spades'], Card.values))).to.equal(true);
        expect(Card.isValid(Deck.createSet(['spades'], Card.values)[0])).to.equal(true);
        done();
      });
      it('should create the desired amount of cards', (done) => {
        expect(Deck.createSet(['spades'], Card.values).length).to.equal(14);
        done();
      });
      it('should throw a TypeError if called with something that\'s not card values or card suits', (done) => {
        expect(() => {
          Deck.createSet(Card.suits, 'monkey');
        }).to.throw(TypeError);
        expect(() => {
          Deck.createSet('monkey', Card.values);
        }).to.throw(TypeError);
        done();
      });
    });
  });
});
