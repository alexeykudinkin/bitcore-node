'use strict';

var BaseService = require('../service');
var inherits = require('util').inherits;

var async = require('async');

var bitcore = require('bitcore-lib');

var $ = bitcore.util.preconditions;

var Transaction = bitcore.Transaction;

/**
 * This service exposes a common-blockchain (https://github.com/common-blockchain/common-blockchain) interface
 *
 * @param {Object} options
 * @param {Node} options.node - A reference to the node
 */
var CommonBlockchainInterfaceService = function (options) {
  BaseService.call(this, options)
};

inherits(CommonBlockchainInterfaceService, BaseService);

CommonBlockchainInterfaceService.dependencies = [ 'address' ];


CommonBlockchainInterfaceService.prototype.getAPIMethods = function () {
  return [
    [ 'getAddressesSummary',        this, this.getAddressesSummary,         1 ],
    [ 'getAddressesTransactions',   this, this.getAddressesTransactions,    2 ],
    [ 'getAddressesUnspents',       this, this.getAddressesUnspents,        1 ],
    [ 'getTransactions',            this, this.getTransactions,             1 ],
    [ 'getTransactionsSummary',     this, this.getTransactionsSummary,      1 ],
    [ 'getUnconfirmedTransactions', this, this.getUnconfirmedTransactions,  0 ],
    [ 'propagateTransactions',      this, this.propagateTransactions,       1 ]
  ]
};


/**
 * Gets summary for the address supplied
 *
 * @param addresses
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getAddressesSummary = function (addresses, callback) {

  // TODO: Replace with `typeforce`
  $.checkArgument(Array.isArray(addresses), 'Must provide an array of addresses!');

  var self = this;

  async.map(
    addresses,
    function (addr, callback) {
      self.node.services.address.getAddressSummary(addr, { noTxList: true }, function (err, result) {
        if (!err) {
          callback(err, {
            address:        addr,
            balance:        result['balance'],
            totalReceived:  result['totalReceived'],
            txCount:        result['appearances']
          })
        } else {
          callback(err, result);
        }
      })
    },
    callback
  );
};

/**
 * Lists all transactions' details for the addresses supplied
 *
 * @param addresses
 * @param blockHeight?
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getAddressesTransactions = function (addresses, blockHeight, callback) {

  // TODO: Replace with `typeforce`
  $.checkArgument(Array.isArray(addresses), 'Must provide an array of addresses!');

  var self = this;

  var options = {
    start:  Transaction.NLOCKTIME_MAX_VALUE,
    end:    blockHeight || 0,
    queryMempool: false
  };

  self.node.services.address.getAddressHistory(addresses, options, function (err, result) {
    if (!err) {
      async.map(
        result['items'] || [], function (item, reduce) {
          var tx = item.transaction;

          reduce(err, {
            blockHeight:  item.height,
            blockId:      tx.blockHash,
            txId:         tx.id,
            txHex:        tx.serialize(/* unsafe = */ true)
          })
        },
        callback
      );
    } else {
      callback(err, result);
    }
  })
};


/**
 * Gets unspents outputs for the addresses supplied
 *
 * @param addresses
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getAddressesUnspents = function (addresses, callback) {

  // TODO: Replace with `typeforce`
  $.checkArgument(Array.isArray(addresses), 'Must provide an array of addresses!');

  var self = this;

  self.node.services.address.getUnspentOutputs(addresses, /* queryMempool = */ false, function (err, result) {
    if (!err) {
      async.map(
        result || [], function (unspent, reduce) {
          reduce(err, {
            address:        unspent.address,
            txId:           unspent.txid,
            confirmations:  unspent.confirmations,
            value:          unspent.satoshis,
            vout:           unspent.outputIndex
          })
        },
        callback
      );
    } else {
      callback(err, result);
    }
  })
};


/**
 * Returns transactions corresponding to the ids supplied
 *
 * @param txids
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getTransactions = function (txids, callback) {

  // TODO: Replace with `typeforce`
  $.checkArgument(Array.isArray(txids), 'Must provide an array of tx-ids!');

  var self = this;

  async.map(
    txids,
    function (txid, reduce) {
      self.node.services.db.getTransactionWithBlockInfo(txid, /* queryMempool = */ false, function (err, tx) {
        if (!err) {
          reduce(err, {
            txId:         tx.txid,
            blockId:      tx.blockHash,
            blockHeight:  tx.height,
            txHex:        tx.serialize()
          });
        } else {
          reduce(err, tx);
        }
      })
    },
    callback
  );
};


/**
 * Gets transactions' summaries
 *
 * @param txids
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getTransactionsSummary = function (txids, callback) {

  // TODO: Replace with `typeforce`
  $.checkArgument(Array.isArray(txids), 'Must provide an array of tx-ids!');

  var self = this;

  async.map(
    txids,
    function (txid, reduce) {
      self.node.services.db.getTransactionWithBlockInfo(txid, /* queryMempool = */ false, function (err, tx) {
        if (!err) {
          reduce(err, {
            txId:             tx.txid,
            blockId:          tx.blockHash,
            blockHeight:      tx.height,
            nInputs:          tx.inputs.length,
            nOutputs:         tx.outputs.length,
            totalInputValue:  tx.inputAmount,
            totalOutputValue: tx.outputAmount
          });
        } else {
          reduce(err, tx);
        }
      })
    },
    callback
  );
};


/**
 * Returns the latest unconfirmed transactions (subjective to the node)
 *
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getUnconfirmedTransactions = function (callback) {
  throw "NotImplementedException";
};


/**
 * Propagates supplied transactions (in bitcoin-protocol format) to the blockchain
 *
 * @param txs
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.propagateTransactions = function (txs, callback) {

  // TODO: Replace with `typeforce`
  $.checkArgument(Array.isArray(txs), 'Must provide an object from where to extract data');

  var self = this;

  async.map(
    txs,
    function (tx, reduce) {
      self.node.services.db.sendTransaction(tx, /* queryMempool = */ false, reduce)
    },
    callback
  );
};


/**
 * Returns blocks corresponding to the hashes supplied
 *
 * @param hashes
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getBlocks = function (hashes, callback) {

  // TODO: Replace with `typeforce`
  $.checkArgument(Array.isArray(hashes), 'Must provide an array of block-hashes!');

  var self = this;

  async.map(
    hashes,
    function (hash, reduce) {
      self.node.services.db.getBlock(hash, /* queryMempool = */ false, function (err, block) {
        if (!err) {
          reduce(err, {
            blockId:  block.id,
            blockHex: block.toString()
          });
        } else {
          reduce(err, block);
        }
      })
    },
    callback
  );
};


/**
 * Gets blocks' summaries
 *
 * @param hashes
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getBlocksSummary = function (hashes, callback) {

  // TODO: Replace with `typeforce`
  $.checkArgument(Array.isArray(txids), 'Must provide an array of block-hashes!');

  var self = this;

  async.map(
    hashes,
    function (hash, reduce) {
      self.node.services.db.getBlock(hash, /* queryMempool = */ false, function (err, block) {
        if (!err) {
          var blockIndex  = self.node.services.bitcoind.getBlockIndex(hash);
          var blockSize   = block.toString().length;

          reduce(err, {
            blockId:          block.id,
            prevBlockId:      block.header.prevHash,
            merkleRootHash:   block.header.merkleRoot,
            nonce:            block.header.nonce,
            version:          block.header.version,
            blockHeight:      blockIndex.height,
            blockSize:        blockSize,
            timestamp:        block.header.timestamp,
            txCount:          block.transactions.length
          });
        } else {
          reduce(err, block);
        }
      })
    },
    callback
  );
};


/**
 * Returns the latest unconfirmed transactions (subjective to the node)
 *
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getLatestBlocks = function (callback) {
  throw "NotImplementedException";
};


/**
 * Propagates supplied transactions (in bitcoin-protocol format) to the blockchain
 *
 * @param block
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.propagateBlock = function (block, callback) {
  throw "NotImplementedException";
};


/**
 * Function which is called when module is first initialized
 */
CommonBlockchainInterfaceService.prototype.start = function(done) {
  setImmediate(done);
};

/**
 * Function to be called when bitcore-node is stopped
 */
CommonBlockchainInterfaceService.prototype.stop = function(done) {
  setImmediate(done);
};

module.exports = CommonBlockchainInterfaceService;
