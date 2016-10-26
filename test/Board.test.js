/**
 * Tests for the Card type.
 *
 * @author Molly Arhammar
 * @version 1.16.1
 */

'use strict';

const expect = require('chai').expect;

const BlackJackPlayer = require('../src/BlackJackPlayer.js');
const Dealer = require('../src/Dealer.js');

describe('Board', () => {
  const PLAYERS = [new BlackJackPlayer('Arthur Dent'), new BlackJackPlayer('Ford')];

  let Board;

  describe('Type', () => {
    it('should be defined', (done) => {
      Board = require('../src/Board.js');
      done();
    });
  });

  describe('Constructor', () => {
    let aBoard;

    beforeEach(() => {
      // Create a new Card before every test.
      aBoard = new Board(PLAYERS);
    });

    it('should be instance of Board', (done) => {
      expect(aBoard).to.be.an.instanceOf(Board);
      done();
    });

    it('should have property players', (done) => {
      expect(aBoard).to.have.property('players');
      done();
    });

    it('should have property history', (done) => {
      expect(aBoard).to.have.property('history');
      done();
    });

    it('should have property playRounds', (done) => {
      expect(aBoard).to.have.property('playRounds');
      done();
    });
  });

  describe('Properties', () => {
    describe('players', () => {
      let aBoard;

      beforeEach(() => {
        // Create a new Board before every test.
        aBoard = new Board(PLAYERS);
      });

      it('should be defined', (done) => {
        expect(aBoard).to.have.property('players');
        done();
      });

      it('should be able to be changed to an Array of BlackJackPlayer or to a single BlackJackPlayer', (done) => {
        let aPlayer = new BlackJackPlayer('Arthur');
        aBoard.players = PLAYERS;
        expect(aBoard.players).to.deep.equal(PLAYERS);
        aBoard.players = aPlayer;
        expect(aBoard.players).to.deep.equal([aPlayer]);
        done();
      });

        it('should throw a TypeError when if set to an invalid BlackJackPlayer', (done) => {
            expect(() => {
                aBoard.players = [new Dealer()];
            }).to.throw(TypeError);
            done();
        });

      it('should make a copy of the argument (setter)', (done) => {
        let aPlayer = new BlackJackPlayer('Arthur');
        aBoard.players = PLAYERS;
        expect(aBoard.players).to.not.equal(PLAYERS);
        aBoard.players = aPlayer;
        expect(aBoard.players).to.not.equal(aPlayer);
        done();
      });

      it('should make a copy of the argument (getter)', (done) => {
        let players = aBoard.players;
        expect(aBoard.players).to.not.equal(players);
        done();
      });

    });
    describe('history', () => {
      let aBoard;

      beforeEach(() => {
        // Create a new Board before every test.
        aBoard = new Board(PLAYERS);
      });

      it('should be defined', (done) => {
        expect(aBoard).to.have.property('history');
        done();
      });

      it('should return an array', (done) => {
        expect(Array.isArray(aBoard.history)).to.equal(true);
        done();
      });

      it('should throw an Error if the value tries to be changed (read only)', (done) => {
        expect(() => {
          aBoard.history = [];
        }).to.throw(Error);
        done();
      });
    });

    describe('playRounds', () => {
      let aBoard;

      beforeEach(() => {
        // Create a new Board before every test.
        aBoard = new Board(PLAYERS);

        it('should be defined', (done) => {
          expect(aBoard).to.have.property('playRounds');
          done();
        });

        it('should play a round with each of the players', (done) => {
          aBoard.playRounds();
          expect(aBoard.history.length).to.equal('3');
          done();
        });

        it('should rehuffle the Deck automatically', (done) => {
          expect(() => {
            for (let i = 0; i < 10; i += 1) {
              aBoard.playRounds();
            }
          }).to.not.throw(Error);
          done();
        });

      });
    });
  });

  describe('Prototype methods', () => {
    describe('toString method', () => {
      let aBoard;

      beforeEach(() => {
        // Create a new Board before every test.
        aBoard = new Board(PLAYERS);
      });

      it('should be defined', (done) => {
        expect(Board.prototype).to.have.property('toString').that.is.a('Function');
        done();
      });

      it('should return a string', (done) => {
        expect(Board.prototype).to.have.ownProperty('toString');
        expect(aBoard.toString()).to.be.a('string');
        done();
      });

      it('should return a record of all the rounds', (done) => {
        expect(aBoard.toString().indexOf('Arthur').toString()).to.not.equal(-1);
        expect(aBoard.toString().indexOf('Ford').toString()).to.not.equal(-1);
        done();
      });

    });
  });
});
