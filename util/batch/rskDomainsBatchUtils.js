const {
  randomHex, isAddress, isHexStrict, isBN, sha3, numberToHex, padLeft, asciiToHex,
} = require('web3-utils');
const rlp = require('rlp');

/**
 * Creates an array of n secrets of 32 bytes
 * @param {number} n amount of secrets to create
 * @returns {bytes32[]} secrets
 */
function createSecrets(n) {
  const secrets = [];

  for (let i = 0; i < n; i += 1) {
    secrets.push(randomHex(32));
  }

  return secrets;
}

/**
 * Validates data for RSK Domains Batch
 * @param {string[]} labels of the domains to be registered
 * @param {address} owner for all registered domains
 * @param {bytes32[]} secrets for each of the names
 * @param {BN} duration for all registered domains
 */
function validate(labels, owner, secrets, duration) {
  if (labels.length !== secrets.length) {
    throw new Error('Invalid amount of secrets');
  }

  for (let i = 0; i < labels.length; i += 1) {
    if (!labels[i].length > 0 || !labels[i].match(/^[0-9a-z]+$/)) {
      throw new Error(`Invalid label: ${labels[i]}`);
    }
  }

  if (!isAddress(owner)) {
    throw new Error('Invalid owner');
  }

  for (let i = 0; i < secrets.length; i += 1) {
    if (!isHexStrict(secrets[i]) || secrets[i].length !== 68) {
      throw new Error(`Invalid secret: ${secrets[i]}`);
    }
  }

  if (!isBN(duration)) {
    throw new Error('Invalid duration');
  }
}

/**
 * Creates a commitment for each label. Assumes that parameters were validated with `validate`.
 * @param {Promise<tx>} makeCommitment contract function to make commitment
 * @param {string[]} labels of the domains to be registered
 * @param {address} owner for all registered domains
 * @param {bytes32[]} secrets for each of the names
 * @returns {bytes32[]} commitments created
 */
async function makeCommitments(makeCommitment, labels, owner, secrets) {
  const commitments = [];

  for (let i = 0; i < labels.length; i += 1) {
    commitments.push(makeCommitment(sha3(labels[i]), owner, secrets[i]));
  }

  return Promise.all(commitments);
}

/**
 * Polls until all the last commits of each list of commitments is able to be revealed.
 * @param {Promise<bool>} canReveal contract function for `canReveal`
 * @param {bytes32[][]} commitmentLists commitments to poll
 * @param {number} interval for each check
 * @param {number} timeout to reject the Promise
 */
async function pollUntilCommitted(canReveal, commitmentLists, interval = 5000, timeout = 120000) {
  const lastCommits = [];
  const endTime = Number(new Date()) + timeout;

  for (let i = 0; i < commitmentLists.length; i += 1) {
    lastCommits.push(commitmentLists[i][commitmentLists[i].length - 1]);
  }

  const poll = (resolve, reject) => {
    const allRevealChecks = [];

    for (let i = 0; i < lastCommits.length; i += 1) {
      allRevealChecks.push(canReveal(lastCommits[i]));
    }

    Promise.all(allRevealChecks).then((result) => {
      if (result.every((r) => r)) resolve(result);
      else if (Number(new Date()) < endTime) setTimeout(poll, interval, resolve, reject);
      else reject(new Error('Polling timeout'));
    });
  };

  return new Promise(poll);
}

const REGISTER_SIGNATURE = '0xc2c414c8';

/**
 * Encodes one register data to use with transferAndCall.
 * Assumes that parameters were validated with `validate`.
 * @param {string} label of the domain to be registered
 * @param {address} owner for all registered domains
 * @param {bytes32} secret valid for the commitment
 * @param {BN} duration for all registered domains
 */
function encodeOneRegister(label, owner, secret, duration) {
  const parsedOwner = owner.toLowerCase().slice(2);

  const parsedSecret = secret.slice(2);

  const parsedDuration = padLeft(
    numberToHex(duration).slice(2),
    64,
    '0',
  );

  const parsedLabel = asciiToHex(label).slice(2);

  return `${REGISTER_SIGNATURE}${parsedOwner}${parsedSecret}${parsedDuration}${parsedLabel}`;
}

/**
 * Encodes (rlp) register data to use with transferAndCall.
 * Assumes that parameters were validated with `validate`.
 * @param {string[]} labels of the domains to be registered
 * @param {address} owner for all registered domains
 * @param {bytes32[]} secrets for each of the names
 * @param {BN} duration for all registered domains
 * @param {Promise<BN>} price contract function for `price`
 */
async function encodeRegister(labels, owner, secrets, duration, price) {
  const datas = [];

  for (let i = 0; i < labels.length; i += 1) {
    datas.push(encodeOneRegister(labels[i], owner, secrets[i], duration));
  }

  const cost = await price('', 0, duration);

  return `0x${rlp.encode([cost, datas]).toString('hex')}`;
}

module.exports = {
  createSecrets,
  validate,
  makeCommitments,
  pollUntilCommitted,
  encodeOneRegister,
  encodeRegister,
};
