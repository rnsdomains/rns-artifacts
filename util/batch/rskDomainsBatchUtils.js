const {
  randomHex, isAddress, isHexStrict, isBN, sha3,
} = require('web3-utils');

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

    Promise.all(allRevealChecks).then(result => {
      if (result.every(r => r)) resolve(result);
      else if (Number(new Date()) < endTime) setTimeout(poll, interval, resolve, reject);
      else reject(new Error('Polling timeout'));
    });
  }

  return new Promise(poll);
}

module.exports = {
  createSecrets,
  validate,
  makeCommitments,
  pollUntilCommitted,
};
