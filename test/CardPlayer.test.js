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
});
