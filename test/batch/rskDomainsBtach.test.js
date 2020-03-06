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
const {
  createSecrets, makeCommitments, encodeOneRegister, encodeRegister,
} = require('../../util/batch/rskDomainsBatchUtils');

contract('RSK Domains Batch', (accounts) => {
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
    await rns.setSubnodeOwner('0x00', web3.utils.sha3('rsk'), this.nodeOwner.address);

    const namePrice = await NamePrice.new();

    const bytesUtils = await BytesUtils.new();
    await FIFSRegistrar.link('BytesUtils', bytesUtils.address);

    this.fifs = await FIFSRegistrar.new(
      this.rif.address,
      this.nodeOwner.address,
      accounts[1],
      namePrice.address,
    );
    await this.nodeOwner.addRegistrar(this.fifs.address);

    this.batch = await RSKDomainsBatch.new(this.fifs.address, this.rif.address);
  });

  describe('make commitments', async () => {
    it('should commit to fifs registrar', async () => {
      const labels = ['label0', 'label1', 'label2', 'label3', 'label4'];

      const commitments = await makeCommitments(
        this.fifs.makeCommitment,
        labels,
        accounts[0],
        createSecrets(labels.length),
      );

      await this.batch.batchCommit(commitments);

      await time.increase(time.duration.minutes('1'));

      const canRevealAll = [];

      for (let i = 0; i < commitments.length; i += 1) {
        canRevealAll.push(this.fifs.canReveal(commitments[i]));
      }

      const result = await Promise.all(canRevealAll);

      for (let i = 0; i < commitments.length; i += 1) {
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

    it('should allow to register domains after committing', async () => {
      const labels = ['label0', 'label1', 'label2', 'label3', 'label4'];
      const owner = accounts[0];
      const secrets = createSecrets(labels.length);

      const commitments = await makeCommitments(
        this.fifs.makeCommitment,
        labels,
        owner,
        secrets,
      );

      await this.batch.batchCommit(commitments);

      await time.increase(time.duration.minutes('1'));

      const registerAll = [];

      for (let i = 0; i < commitments.length; i += 1) {
        registerAll.push(
          this.rif.transferAndCall(
            this.fifs.address,
            web3.utils.toBN('2000000000000000000'),
            encodeOneRegister(labels[i], owner, secrets[i], web3.utils.toBN('1')),
          ),
        );
      }

      await Promise.all(registerAll);

      const allCurrentOwners = [];

      for (let i = 0; i < commitments.length; i += 1) {
        allCurrentOwners.push(this.nodeOwner.ownerOf(web3.utils.sha3(labels[i])));
      }

      const currentOwners = await Promise.all(allCurrentOwners);

      for (let i = 0; i < commitments.length; i += 1) {
        assert.equal(currentOwners[i], owner);
      }
    });
  });

  describe('reveal commitments', async () => {
    it('should transfer and call to fifs registrar', async () => {
      const labels = [
        'ilanolkies', 'ilanolkies2',
      ];
      const owner = accounts[0];
      const secrets = createSecrets(labels.length);
      const duration = web3.utils.toBN('20');

      const commitments = await makeCommitments(
        this.fifs.makeCommitment,
        labels,
        owner,
        secrets,
      );

      await this.batch.batchCommit(commitments);

      await time.increase(time.duration.minutes('1'));

      const data = await encodeRegister(labels, owner, secrets, duration, this.fifs.price);

      const cost = (await this.fifs.price('', web3.utils.toBN('0'), duration)).mul(web3.utils.toBN('2'));

      await this.rif.transferAndCall(this.batch.address, cost, data);

      const owners = [];

      for (let i = 0; i < labels.length; i += 1) {
        owners.push(this.nodeOwner.ownerOf(web3.utils.sha3(labels[i])));
      }

      await Promise.all(owners).then((result) => {
        for (let i = 0; i < result.length; i += 1) {
          assert.equal(result[i], owner);
        }
      });
    });
  });
});
