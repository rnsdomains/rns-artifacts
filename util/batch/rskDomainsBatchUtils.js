const assert = require('assert');
const { isAddress, isHexStrict, isBN } = require('web3-utils');

/**
 * Validates data for RSK Domains Batch
 * @param {string[]} labels of the domains to be registered
 * @param {address} owner for all registered domains
 * @param {bytes32[]} secrets for each of the names
 * @param {BN} duration for all registered domains
 */
function validate (labels, owner, secrets, duration) {
  for (let i = 0; i < labels.length; i+=1) {
    if (!labels[i].length > 0 || !labels[i].match(/^[0-9a-z]+$/)) {
      throw new Error(`Invalid label: ${labels[i]}`);
    }
  }

  if (!isAddress(owner)) {
    throw new Error(`Invalid owner`);
  }

  for (let i = 0; i < secrets.length; i+=1) {
    if(!isHexStrict(secrets[i]) || secrets[i].length !== 68) {
      throw new Error(`Invalid secret: ${secrets[i]}`);
    }
  }

  if (!isBN(duration)) {
    throw new Error(`Invalid duration`);
  }
}

module.exports = {
  validate,
};
