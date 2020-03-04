const ERC677 = artifacts.require('ERC677');
const RNS = artifacts.require('RNS');
const NodeOwner = artifacts.require('NodeOwner');
const NamePrice = artifacts.require('NamePrice');
const BytesUtils = artifacts.require('BytesUtils');
const FIFSRegistrar = artifacts.require('FIFSRegistrar');
const RSKDomainsBatch = artifacts.require('RSKDomainsBatch');

const assert = require('assert');
const namehash = require('eth-ens-namehash');
const { time } = require('@openzeppelin/test-helpers');
const { createSecrets, makeCommitments } = require('../../util/batch/rskDomainsBatchUtils');

contract('make commitments', (accounts) => {
  beforeEach(async () => {
    this.rif = await ERC677.new(
      accounts[0],
      web3.utils.toBN('1000000000000000000000'),
      'RIF',
      'RIF',
      web3.utils.toBN('18'),
    );

    const rootNode = namehash.hash('rsk');

    const rns = await RNS.new();
    this.nodeOwner = await NodeOwner.new(rns.address, rootNode);
    const namePrice = await NamePrice.new();

    const bytesUtils = await BytesUtils.new();
    await FIFSRegistrar.link('BytesUtils', bytesUtils.address);

    this.fifs = await FIFSRegistrar.new(
      this.rif.address,
      this.nodeOwner.address,
      accounts[1],
      namePrice.address,
    );

    const labels = ['label0', 'label1', 'label2', 'label3', 'label4'];

    this.commitments = await makeCommitments(
      this.fifs.makeCommitment,
      labels,
      accounts[0],
      createSecrets(labels.length),
    );

    this.batch = await RSKDomainsBatch.new(this.fifs.address);
  });

  it('should commit to fifs registrar', async () => {
    await this.batch.batchCommit(this.commitments);

    await time.increase(time.duration.minutes('1'));

    const canRevealAll = [];

    for (let i = 0; i < this.commitments.length; i += 1) {
      canRevealAll.push(this.fifs.canReveal(this.commitments[i]));
    }

    const result = await Promise.all(canRevealAll);

    for (let i = 0; i < this.commitments.length; i += 1) {
      assert(result[i]);
    }
  });

  it('saturation test', async () => {
    const labels = [];

    const length = 250;

    for (let i = 0; i < length; i += 1) {
      labels.push(`label${i}`);
    }

    const commitments = await makeCommitments(
      this.fifs.makeCommitment,
      labels,
      accounts[0],
      createSecrets(length),
    );

    await this.batch.batchCommit(commitments);

    await time.increase(time.duration.minutes('1'));

    const canRevealAll = [];

    for (let i = 0; i < length; i += 1) {
      canRevealAll.push(this.fifs.canReveal(commitments[i]));
    }

    const result = await Promise.all(canRevealAll);

    for (let i = 0; i < length; i += 1) {
      assert(result[i]);
    }
  });
});
