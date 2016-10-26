/**
* Tests for the BlackJackPlayer type.
*
* @author Molly Arhammar
* @version 1.16.1
*/

'use strict';

const expect = require('chai').expect;
const Card = require('../src/Card.js');
const CardPlayer = require('../src/CardPlayer.js');
const Dealer = require('../src/Dealer.js');

describe('BlackJackPlayer', () => {
  const aceHAND = [new Card('ACE', 'spades'), new Card('ace', 'hearts'), new Card('five', 'diamonds')];
  const HAND = [new Card('five', 'spades'), new Card('two', 'hearts'), new Card('five', 'diamonds')];
  const ACE = new Card('ace', 'hearts');
  const TEN = new Card('ten', 'hearts');
  const NAME = 'Marvin';

  let BlackJackPlayer;

  describe('Type', () => {
    it('should be defined', (done) => {
      BlackJackPlayer = require('../src/BlackJackPlayer.js');
      done();
    });
  });

  describe('Constructor', () => {
    let aPlayer;

    beforeEach(() => {
      // Create a new Player before every test.
      aPlayer = new BlackJackPlayer();
    });

    it('should be instance of BlackJackPlayer', (done) => {
      expect(aPlayer).to.be.an.instanceOf(BlackJackPlayer);
      done();
    });

    it('should have constructor BlackJackPlayer', (done) => {
      expect(aPlayer.constructor).to.equal(BlackJackPlayer);
      done();
    });

    it('should be instance of CardPlayer', (done) => {
      expect(aPlayer).to.be.an.instanceOf(CardPlayer);
      done();
    });

    it('should not be instance of Dealer', (done) => {
      expect(aPlayer).not.to.be.an.instanceOf(Dealer);
      done();
    });

    it('should have own property limit', (done) => {
      expect(aPlayer).to.have.ownProperty('limit');
      done();
    });

    it('should have own property bank', (done) => {
      expect(aPlayer).to.have.ownProperty('bank');
      done();
    });

    it('should have own property bet', (done) => {
      expect(aPlayer).to.have.ownProperty('bet');
      done();
    });

    it('should have inherited property name', (done) => {
      expect(aPlayer).to.have.property('name');
      done();
    });

    it('should have inherited property hand', (done) => {
      expect(aPlayer).to.have.property('hand');
      done();
    });

    it('should have inherited property points', (done) => {
      expect(aPlayer).to.have.property('points');
      done();
    });
  });

  describe('Inherited Properties', () => {
    describe('name', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should return the name', (done) => {
        expect(aPlayer.name).to.equal(NAME);
        done();
      });

      it('should set the name to Blackjack Player if no name is given', (done) => {
        let anotherPlayer = new BlackJackPlayer();
        expect(anotherPlayer.name).to.equal('Blackjack Player');
        done();
      });

      it('should be able to be changed', (done) => {
        aPlayer.name = 'Karlsson';
        expect(aPlayer.name).to.equal('Karlsson');
        done();
      });

      it('should throw a TypeError if the text is set to a non-string value', (done) => {
        expect(() => {
          aPlayer.name = undefined;
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.name = null;
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.name = 42;
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.name = {};
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.name = [];
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.name = new String(NAME);
        }).to.throw(TypeError);
        done();
      });

      it('should throw an Error when if the name is set to an empty string', (done) => {
        expect(() => {
          aPlayer.name = '';
        }).to.throw(Error);
        done();
      });

      it('should throw an Error if the text is to a string of a length greater than 20.', (done) => {
        expect(() => {
          aPlayer.name = 'A'.repeat(21);
        }).to.throw(Error);
        done();
      });

    });

    describe('hand', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should return the hand', (done) => {
        expect(aPlayer.hand).to.deep.equal([]);
        aPlayer.hand = HAND;
        expect(aPlayer.hand).to.deep.equal(HAND);
        done();
      });

      it('should set a copy of the hand', (done) => {
        aPlayer.hand = HAND;
        expect(aPlayer.hand).to.not.equal(HAND);
        done();
      });

      it('should return a copy of the hand', (done) => {
        aPlayer.hand = HAND;
        let myHand = aPlayer.hand;
        myHand = aceHAND;
        expect(aPlayer.hand).to.not.deep.equal(aceHAND);
        done();
      });

      it('should throw a TypeError if the hand is set no a non Array value', (done) => {
        expect(() => {
          aPlayer.hand = 42;
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.hand = new Card();
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.hand = null;
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.hand = undefined;
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.hand = 'hej';
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.hand = false;
        }).to.throw(TypeError);
        done();
      });

      it('should throw an Error if the hand is set to an Array of non valid cards', (done) => {
        expect(() => {
          aPlayer.hand = [42];
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.hand = [{suit: 'sppdes', value: 'ace'}];
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.hand = [undefined];
        }).to.throw(TypeError);
        expect(() => {
          aPlayer.hand = [new Card(), undefined];
        }).to.throw(TypeError);
        done();
      });

    });
    describe('points', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(aPlayer).to.have.property('points');
        done();
      });
      it('should return the points', (done) => {
        expect(aPlayer.points).to.equal(0);
        aPlayer.hand = HAND;
        expect(aPlayer.points).to.equal(12);
        done();
      });
      it('should automatically change the acevalue if points go over 21', (done) => {
        aPlayer.hand = aceHAND;
        expect(aPlayer.points).to.equal(20);
        expect(aPlayer.hand[1].acevalue).to.equal(1);
        done();
      });
      it('should not change the acevalue of more cards than necessary', (done) => {
        aPlayer.hand = aceHAND;
        expect(aPlayer.points).to.equal(20);
        expect(aPlayer.hand[1].acevalue).to.equal(1);
        expect(aPlayer.hand[0].acevalue).to.equal(14);
        done();
      });
      it('should change the next acevalue when necessary', (done) => {
        aPlayer.hand = aceHAND;
        expect(aPlayer.points).to.equal(20);
        aPlayer.addToHand(new Card('ace', 'clubs'));
        expect(aPlayer.points).to.equal(21);
        expect(aPlayer.hand[1].acevalue).to.equal(1);
        expect(aPlayer.hand[0].acevalue).to.equal(1);
        expect(aPlayer.hand[3].acevalue).to.equal(14);
        done();
      });
    });
  });

  describe('Own Properties', () => {
    describe('limit', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(aPlayer).to.have.property('limit');
        done();
      });
      it('should return the limit', (done) => {
        expect(aPlayer.limit).to.equal(15);
        done();
      });
      it('should throw an Error if the limit is set (should be read-only!)', (done) => {
        expect(() => {
          aPlayer.limit = 17;
        }).to.throw(Error);
        done();
      });
    });

    describe('bank', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(aPlayer).to.have.property('bank');
        done();
      });
      it('should return the bank balance', (done) => {
        expect(aPlayer.bank).to.equal(100);
        done();
      });
      it('should throw an Error if the bank is set to a non number or a number below 0', (done) => {
        expect(() => {
          aPlayer.bank = undefined;
        }).to.throw(Error);
        expect(() => {
          aPlayer.bank = null;
        }).to.throw(Error);
        expect(() => {
          aPlayer.bank = 'hej';
        }).to.throw(Error);
        expect(() => {
          aPlayer.bank = {};
        }).to.throw(Error);
        expect(() => {
          aPlayer.bank = [];
        }).to.throw(Error);
        expect(() => {
          aPlayer.bank = -22;
        }).to.throw(Error);
        done();
      });
    });

    describe('bet', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(aPlayer).to.have.property('bet');
        done();
      });
      it('should return the bet', (done) => {
        expect(aPlayer.bet).to.equal(25);
        done();
      });
      it('should throw an Error if the bet is set (should be read-only!)', (done) => {
        expect(() => {
          aPlayer.bet = 17;
        }).to.throw(Error);
        done();
      });
    });

    describe('inPlay', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should have property', (done) => {
        expect(aPlayer).to.have.property('inPlay');
        done();
      });

      it('should return true', (done) => {
        expect(aPlayer).to.have.property('inPlay', true);
        aPlayer.hand = aceHAND;
        expect(aPlayer).to.have.property('inPlay', true);
        done();
      });

      it('should return false', (done) => {
        aPlayer.hand = HAND;
        aPlayer.bank = 0;
        expect(aPlayer).to.have.property('inPlay', false);
        aPlayer.bank = 100;
        aPlayer.addToHand(new Card('king', 'spades'));
        expect(aPlayer).to.have.property('inPlay', false);
        done();
      });

      it('should throw an Error if the inPlay is set (should be read-only!)', (done) => {
        expect(() => {
          aPlayer.inPlay = true;
        }).to.throw(Error);
        done();
      });
    });
  });

  describe('Inherited prototype methods', () => {
    describe('valueOf', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(aPlayer).to.have.property('valueOf').that.is.a('Function');
        done();
      });
      it('should return the points', (done) => {
        expect(aPlayer.valueOf()).to.equal(0);
        aPlayer.hand = aceHAND;
        expect(aPlayer.valueOf()).to.equal(20);
        done();
      });
    });
    describe('equals', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(aPlayer).to.have.property('equals').that.is.a('Function');
        done();
      });

      it('should return true', (done) => {
        let anotherPlayer = new BlackJackPlayer(NAME);
        expect(aPlayer.equals(anotherPlayer)).to.equal(true);
        expect(aPlayer.equals(new Dealer(NAME))).to.equal(true);
        done();
      });

      it('should return false', (done) => {
        let anotherPlayer = new BlackJackPlayer('Inte Karlsson');
        expect(aPlayer.equals(anotherPlayer)).to.equal(false);
        expect(aPlayer.equals([])).to.equal(false);
        expect(aPlayer.equals(42)).to.equal(false);
        expect(aPlayer.equals('Hej')).to.equal(false);
        expect(aPlayer.equals(null)).to.equal(false);
        expect(aPlayer.equals(true)).to.equal(false);
        done();
      });
    });

    describe('addToHand', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(aPlayer).to.have.property('addToHand').that.is.a('Function');
        done();
      });

      it('should add a card to the hand', (done) => {
        aPlayer.addToHand(ACE);
        expect(aPlayer.hand).to.deep.equal([ACE]);
        done();
      });

      it('should add a copy of the card to the hand', (done) => {
        aPlayer.addToHand(ACE);
        expect(aPlayer.hand).to.not.equal([ACE]);
        done();
      });

      it('should throw Error if non valid card is added to hand.', (done) => {
        expect(() => {
          aPlayer.addToHand(undefined);
        }).to.throw(Error);
        expect(() => {
          aPlayer.addToHand('hej');
        }).to.throw(Error);
        expect(() => {
          aPlayer.addToHand({});
        }).to.throw(Error);
        expect(() => {
          aPlayer.addToHand([]);
        }).to.throw(Error);
        expect(() => {
          aPlayer.addToHand({suit: 'spades', value:'ace'});
        }).to.throw(Error);
        done();
      });
    });

    describe('reset', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(aPlayer).to.have.property('reset').that.is.a('Function');
        done();
      });

      it('should set hand to empty array', (done) => {
        aPlayer.hand = HAND;
        aPlayer.reset()
        expect(aPlayer.hand).to.deep.equal([]);
        done();
      });

      it('should return the hand', (done) => {
        aPlayer.hand = HAND;
        let theHand = aPlayer.reset();
        expect(theHand).to.deep.equal(HAND);
        done();
      });
    });
  });

  describe('Own prototype methods', () => {
    describe('clone', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(BlackJackPlayer.prototype).to.have.ownProperty('clone');
        expect(aPlayer).to.have.property('clone').that.is.a('Function');
        done();
      });

      it('should return a BlackJackPlayer object', (done) => {
        expect(aPlayer.clone()).to.be.an.instanceof(BlackJackPlayer);
        done();
      });

      it('should return a copy', (done) => {
        expect(aPlayer.clone()).to.not.equal(aPlayer);
        expect(aPlayer.clone()).to.deep.equal(aPlayer);
        done();
      });

      it('should copy the hand (non privacy-leakish)', (done) => {
        expect(aPlayer.clone().hand).to.deep.equal(aPlayer.hand);
        expect(aPlayer.clone().hand).to.not.equal(aPlayer.hand);
        done();
      });
    });

    describe('requestCard', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(BlackJackPlayer.prototype).to.have.ownProperty('requestCard');
        expect(aPlayer).to.have.property('requestCard').that.is.a('Function');
        done();
      });

      it('should return false when player is not in play', (done) => {
        aPlayer.hand = HAND;
        aPlayer.addToHand(TEN);
        expect(aPlayer.requestCard()).to.equal(false);
        aPlayer.bank = 0;
        expect(aPlayer.requestCard()).to.equal(false);
        done();
      });

      it('should return false when player has reached their limit', (done) => {
        aPlayer.hand = aceHAND;
        expect(aPlayer.requestCard()).to.equal(false);
        done();
      });

    });

    describe('makeBet', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(BlackJackPlayer.prototype).to.have.ownProperty('makeBet');
        expect(aPlayer).to.have.property('makeBet').that.is.a('Function');
        done();
      });

      it('should return a number', (done) => {
        expect(typeof aPlayer.makeBet()).to.equal('number');
        done();
      });

      it('should return 25', (done) => {
        expect(aPlayer.makeBet()).to.equal(25);
        done();
      });

      it('should return whatever the player has left in the bank if the balance is less than 30', (done) => {
        aPlayer.bank = 15;
        expect(aPlayer.makeBet()).to.equal(15);
        done();
      });
    });

    describe('toString', () => {
      let aPlayer;

      beforeEach(() => {
        // Create a new Player before every test.
        aPlayer = new BlackJackPlayer(NAME);
      });

      it('should be defined', (done) => {
        expect(BlackJackPlayer.prototype).to.have.ownProperty('toString');
        expect(aPlayer).to.have.property('toString').that.is.a('Function');
        done();
      });

      it('should return a string', (done) => {
        expect(typeof aPlayer.toString()).to.equal('string');
        done();
      });

    });
  });
});
