/**
 * Tests for the CardPlayer type.
 *
 * @author Molly Arhammar
 * @version 1.16.1
 */

'use strict';

const expect = require('chai').expect;

describe('CardPlayer', () => {

  let CardPlayer;

  describe('Type', () => {
    it('should be defined', (done) => {
      CardPlayer = require('../src/CardPlayer.js');
      done();
    });
  });

  describe('Constructor', () => {
    it('should be abstract', (done) => {
      expect(() => {
        new CardPlayer();
      }).to.throw(Error);
      done();
    });
  });

  describe('Properties', () => {
    describe('valueOf', () => {
      it('should be defined', (done) => {
        expect(CardPlayer.prototype).to.have.property('valueOf').that.is.a('Function');
        done();
      });
    });
    describe('toString', () => {
      it('should be defined', (done) => {
        expect(CardPlayer.prototype).to.have.property('toString').that.is.a('Function');
        done();
      });
    });
    describe('equals', () => {
      it('should be defined', (done) => {
        expect(CardPlayer.prototype).to.have.property('equals').that.is.a('Function');
        done();
      });
    });
    describe('addToHand', () => {
      it('should be defined', (done) => {
        expect(CardPlayer.prototype).to.have.property('addToHand').that.is.a('Function');
        done();
      });
    });
    describe('reset', () => {
      it('should be defined', (done) => {
        expect(CardPlayer.prototype).to.have.property('reset').that.is.a('Function');
        done();
      });
    });
  });
});
