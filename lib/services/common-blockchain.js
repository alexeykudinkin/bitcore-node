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
    [ 'addresses.summary',      this, this.getAddressesSummary,       1 ],
    [ 'addresses.transactions', this, this.getAddressesTransactions,  2 ],
    [ 'addresses.transactions', this, this.getAddressesUnspents,      1 ]
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
  // $.checkArgument(Array.isArray(addresses), 'Must provide an object from where to extract data');

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
  $.checkArgument(Array.isArray(addresses), 'Must provide an object from where to extract data');

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
          var tx = item['transaction'];

          reduce(err, {
            blockHeight:  item['height'],
            blockId:      tx.__blockHash,
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
  $.checkArgument(Array.isArray(addresses), 'Must provide an object from where to extract data');

  var self = this;

  self.node.services.address.getUnspentOutputs(addresses, /* queryMempool = */ false, function (err, result) {
    if (!err) {
      async.map(
        result || [], function (unspent, reduce) {
          reduce(err, {
            address:        unspent['address'],
            txId:           unspent['txid'],
            confirmations:  unspent['confirmations'],
            value:          unspent['satoshis'],
            vout:           unspent['outputIndex']
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
