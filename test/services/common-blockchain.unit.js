'use strict';

var should = require('chai').should();
var sinon = require('sinon');

var bitcoreNode = require('../../');
var bitcoreLib = require('bitcore-lib');

var transactionData = require('../data/bitcoin-transactions.json');

var CommonBlockchain = bitcoreNode.services.CommonBlockchain;

var Networks    = bitcoreLib.Networks;
var Block       = bitcoreLib.Block;
var Transaction = bitcoreLib.Transaction;


describe('Common Blockchain Interface', function () {

  var node = {
    datadir: 'testdir',
    network: Networks.testnet,
    services: {
      address:  {},
      db:       {},
      bitcoind: {}
    }
  };

  describe('@constructor', function () {

    // TODO

  });

  describe('#addresses.summary', function () {
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

    var cbs = new CommonBlockchain({ node: node });

    node.services.address.getAddressSummary = sinon.stub().callsArgWith(2, null, summary);

    it('should return summary for the address', function(done) {
      cbs.addresses.summary([ 'mpkDdnLq26djg17s6cYknjnysAm3QwRzu2' ], function(err, summary) {
        should.not.exist(err);

        summary[0].address       .should.equal('mpkDdnLq26djg17s6cYknjnysAm3QwRzu2');
        summary[0].balance       .should.equal(3487110);
        summary[0].totalReceived .should.equal(3487110);
        summary[0].txCount       .should.equal(1);

        done();
      });
    });

  });


  describe('#addresses.transactions', function () {
    var history = {
      totalCount: 1, // The total number of items within "start" and "end"
      items: [
        {
          addresses: {
            'mgY65WSfEmsyYaYPQaXhmXMeBhwp4EcsQW': {
              inputIndexes: [],
              outputIndexes: [0]
            }
          },
          satoshis: 1000000000,
          height: 150, // the block height of the transaction
          confirmations: 3,
          timestamp: 1442948127, // in seconds
          fees: 191,
          transaction: new Transaction(new Buffer(transactionData[1].hex, 'hex'))
        }
      ]
    };

    var cbs = new CommonBlockchain({ node: node });

    node.services.address.getAddressHistory = sinon.stub().callsArgWith(2, null, history);

    it('should return history for all transactions for the addresses', function(done) {
      cbs.addresses.transactions([ 'mgY65WSfEmsyYaYPQaXhmXMeBhwp4EcsQW' ], null, function(err, txs) {
        should.not.exist(err);

        txs[0].txId         .should.equal('47a34f835395b7e01e2ee757a301476e2c3f5f6a9245e655a1842f6db2368a58');
        txs[0].txHex        .should.equal(transactionData[1].hex);
        txs[0].blockHeight  .should.equal(150);
        //txs[0].blockId    .should.equal(3487110);

        done();
      });
    });

  });


  describe('#addresses.unspents', function () {
    var unspentOuts = [
      {
        address: 'mgY65WSfEmsyYaYPQaXhmXMeBhwp4EcsQW',
        txid: '9d956c5d324a1c2b12133f3242deff264a9b9f61be701311373998681b8c1769',
        outputIndex: 1,
        height: 150,
        satoshis: 1000000000,
        script: '76a9140b2f0a0c31bfe0406b0ccc1381fdbe311946dadc88ac',
        confirmations: 3
      }
    ];

    var cbs = new CommonBlockchain({ node: node });

    node.services.address.getUnspentOutputs = sinon.stub().callsArgWith(2, null, unspentOuts);

    it('should return history for all transactions for the addresses', function(done) {
      cbs.addresses.unspents([ 'mgY65WSfEmsyYaYPQaXhmXMeBhwp4EcsQW' ], function(err, txs) {
        should.not.exist(err);

        txs[0].txId           .should.equal('9d956c5d324a1c2b12133f3242deff264a9b9f61be701311373998681b8c1769');
        txs[0].address        .should.equal('mgY65WSfEmsyYaYPQaXhmXMeBhwp4EcsQW');
        txs[0].confirmations  .should.equal(3);
        txs[0].value          .should.equal(1000000000);
        txs[0].vout           .should.equal(1);

        done();
      });
    });

  });


  describe('#transactions.get', function () {
    var tx = new Transaction();

    var txHex = '0100000001a08ee59fcd5d86fa170abb6d925d62d5c5c476359681b70877c04f270c4ef246000000008a47304402203fb9b476bb0c37c9b9ed5784ebd67ae589492be11d4ae1612be29887e3e4ce750220741ef83781d1b3a5df8c66fa1957ad0398c733005310d7d9b1d8c2310ef4f74c0141046516ad02713e51ecf23ac9378f1069f9ae98e7de2f2edbf46b7836096e5dce95a05455cc87eaa1db64f39b0c63c0a23a3b8df1453dbd1c8317f967c65223cdf8ffffffff02b0a75fac000000001976a91484b45b9bf3add8f7a0f3daad305fdaf6b73441ea88ac20badc02000000001976a914809dc14496f99b6deb722cf46d89d22f4beb8efd88ac00000000';

    tx.fromString(txHex);

    var txId = tx.hash;

    tx.__blockHash = '00000000000000001bb82a7f5973618cfd3185ba1ded04dd852a653f92a27c45';
    tx.__height = 314159;
    tx.__timestamp = 1407292005;

    var cbs = new CommonBlockchain({ node: node });

    node.services.db.getTransactionWithBlockInfo = sinon.stub().callsArgWith(2, null, tx);

    it('should return history for all transactions for the addresses', function(done) {
      cbs.transactions.get([ txId ], function(err, txs) {
        should.not.exist(err);

        txs[0].txId         .should.equal(txId);
        txs[0].txHex        .should.equal(txHex);
        txs[0].blockId      .should.equal('00000000000000001bb82a7f5973618cfd3185ba1ded04dd852a653f92a27c45');
        txs[0].blockHeight  .should.equal(314159);

        done();
      });
    });

  });

  describe('#transactions.summary', function () {
    var tx = new Transaction();

    var txHex = '0100000001a08ee59fcd5d86fa170abb6d925d62d5c5c476359681b70877c04f270c4ef246000000008a47304402203fb9b476bb0c37c9b9ed5784ebd67ae589492be11d4ae1612be29887e3e4ce750220741ef83781d1b3a5df8c66fa1957ad0398c733005310d7d9b1d8c2310ef4f74c0141046516ad02713e51ecf23ac9378f1069f9ae98e7de2f2edbf46b7836096e5dce95a05455cc87eaa1db64f39b0c63c0a23a3b8df1453dbd1c8317f967c65223cdf8ffffffff02b0a75fac000000001976a91484b45b9bf3add8f7a0f3daad305fdaf6b73441ea88ac20badc02000000001976a914809dc14496f99b6deb722cf46d89d22f4beb8efd88ac00000000';

    tx.fromString(txHex);

    var txId = tx.hash;

    tx.__blockHash = '00000000000000001bb82a7f5973618cfd3185ba1ded04dd852a653f92a27c45';
    tx.__height = 314159;
    tx.__timestamp = 1407292005;

    var cbs = new CommonBlockchain({ node: node });

    node.services.db.getTransactionWithBlockInfo = sinon.stub().callsArgWith(2, null, tx);

    it('should return history for all transactions for the addresses', function(done) {
      cbs.transactions.summary([ txId ], function(err, txs) {
        should.not.exist(err);

        txs[0].txId             .should.equal(txId);
        txs[0].blockId          .should.equal('00000000000000001bb82a7f5973618cfd3185ba1ded04dd852a653f92a27c45');
        txs[0].blockHeight      .should.equal(314159);
        txs[0].nInputs          .should.equal(0);
        txs[0].nOutputs         .should.equal(0);
        txs[0].totalInputValue  .should.equal(0);
        txs[0].totalOutputValue .should.equal(0);

        done();
      });
    });

  });


  describe('#blocks.get', function () {
    var blockData = require('../data/livenet-345003.json');
    var blockBuffer = new Buffer(blockData, 'hex');

    var block = Block.fromBuffer(blockBuffer);

    var cbs = new CommonBlockchain({ node: node });

    node.services.db.getBlock = sinon.stub().callsArgWith(2, null, block);

    it('should return history for all transactions for the addresses', function(done) {
      cbs.blocks.get([ '00000000000000000593b60d8b4f40fd1ec080bdb0817d475dae47b5f5b1f735' ], function(err, blocks) {
        should.not.exist(err);

        blocks[0].blockId   .should.equal('00000000000000000593b60d8b4f40fd1ec080bdb0817d475dae47b5f5b1f735');
        blocks[0].blockHex  .should.equal(blockData);

        done();
      });
    });

  });


  describe('#blocks.summary', function () {
    var blockData = require('../data/livenet-345003.json');
    var blockBuffer = new Buffer(blockData, 'hex');

    var block = Block.fromBuffer(blockBuffer);

    var blockIndex = { height: 10 };

    var cbs = new CommonBlockchain({ node: node });

    node.services.db.getBlock             = sinon.stub().callsArgWith(2, null, block);
    node.services.bitcoind.getBlockIndex  = sinon.stub().returns(blockIndex);

    it('should return history for all transactions for the addresses', function(done) {
      cbs.blocks.summary([ '00000000000000000593b60d8b4f40fd1ec080bdb0817d475dae47b5f5b1f735' ], function(err, bs) {
        should.not.exist(err);

        bs[0].blockId         .should.equal('00000000000000000593b60d8b4f40fd1ec080bdb0817d475dae47b5f5b1f735');
        bs[0].prevBlockId     .should.equal('25c31a5ecbbdc9509e1ddf3330d0e08619213fec75d040170000000000000000');
        bs[0].merkleRootHash  .should.equal('569070567854dd4cc9f6b82c6f5ba115e38b05f073575f983c471aab487f61dc');
        bs[0].nonce           .should.equal(1970979152);
        bs[0].version         .should.equal(2);
        bs[0].blockHeight     .should.equal(10);
        bs[0].blockSize       .should.equal(232714);
        bs[0].timestamp       .should.equal(1424818934);
        bs[0].txCount         .should.equal(182);

        done();
      });
    });

  });

});