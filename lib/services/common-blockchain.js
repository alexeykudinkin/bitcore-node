'use strict';

var BaseService = require('../service');
var inherits = require('util').inherits;

var async = require('async');

var bitcore = require('bitcore-lib');

var $ = bitcore.util.preconditions;

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
    [ 'addresses.summary', this, this.getAddressSummary, 1 /* ? */ ]
  ]
};


/**
 *
 *
 * @param addresses
 * @param callback
 */
CommonBlockchainInterfaceService.prototype.getAddressSummary = function (addresses, callback) {
  $.checkArgument(Array.isArray(addresses), 'Must provide an object from where to extract data');

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
