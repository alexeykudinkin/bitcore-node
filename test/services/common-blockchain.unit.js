'use strict';

var should = require('chai').should();
var sinon = require('sinon');

var bitcoreNode = require('../../');
var bitcoreLib = require('bitcore-lib');

var CommonBlockchain = bitcoreNode.services.CommonBlockchain;

var Networks  = bitcoreLib.Networks;

describe('Common Blockchain Interface', function () {

  describe('@constructor', function () {

    // TODO

  });

  describe('#getAddressesSummary', function () {
    var summary = {
      totalReceived:  3487110,
      totalSpent:     0,
      balance:        3487110,
      unconfirmedBalance: 0,
      appearances:        1,
      unconfirmedAppearances: 1,
      txids: [
        '9f183412de12a6c1943fc86c390174c1cde38d709217fdb59dcf540230fa58a6',
        '689e9f543fa4aa5b2daa3b5bb65f9a00ad5aa1a2e9e1fc4e11061d85f2aa9bc5'
      ]
    };

    var node = {
      datadir: 'testdir',
      network: Networks.testnet,
      services: {
        address: {}
      }
    };

    var cbs = new CommonBlockchain({ node: node});

    node.services.address.getAddressesSummary = sinon.stub().callsArgWith(2, null, summary);

    it('should return summary for the address', function(done) {
      cbs.getAddressesSummary([ 'mpkDdnLq26djg17s6cYknjnysAm3QwRzu2' ], function(err, summary) {
        should.not.exist(err);

        summary[0].address       .should.equal('mpkDdnLq26djg17s6cYknjnysAm3QwRzu2');
        summary[0].balance       .should.equal(3487110);
        summary[0].totalReceived .should.equal(3487110);
        summary[0].txCount       .should.equal(1);

        done();
      });
    });

  });

});