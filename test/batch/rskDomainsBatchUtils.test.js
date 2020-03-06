const ERC677 = artifacts.require('ERC677');
const RNS = artifacts.require('RNS');
const NodeOwner = artifacts.require('NodeOwner');
const NamePrice = artifacts.require('NamePrice');
const BytesUtils = artifacts.require('BytesUtils');
const FIFSRegistrar = artifacts.require('FIFSRegistrar');
const RSKDomainsBatch = artifacts.require('RSKDomainsBatch');

const { toBN } = require('web3-utils');
const assert = require('assert');
const { time } = require('@openzeppelin/test-helpers');
const namehash = require('eth-ens-namehash');
const { createSecrets, validate, makeCommitments, pollUntilCommitted } = require('../../util/batch/rskDomainsBatchUtils');

describe('RSK Domains Batch Utils', () => {
  describe('create secrets', async () => {
    it('should create 10 random secrets', async () => {
      const secrets = createSecrets(10);

      for (let i = 0; i < 10; i += 1) {
        assert.equal(secrets[i].length, 66);
      }
    });
  });

  describe('validate', () => {
    it('should throw on less secrets than labels', () => {
      assert.throws(() => {
        validate(
          ['label1', 'label2'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        );
      }, {
        name: 'Error',
        message: 'Invalid amount of secrets',
      });
    });

    it('should throw on more secrets than labels', () => {
      assert.throws(() => {
        validate(
          ['label1'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200', '0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        );
      }, {
        name: 'Error',
        message: 'Invalid amount of secrets',
      });
    });

    it('should throw on empty label', () => {
      assert.throws(() => {
        validate(
          [''],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        );
      }, {
        name: 'Error',
        message: 'Invalid label: ',
      });
    });

    it('should throw on invalid label', () => {
      assert.throws(() => {
        validate(
          ['&&&'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        );
      }, {
        name: 'Error',
        message: 'Invalid label: &&&',
      });
    });

    it('should throw on label with .', () => {
      assert.throws(() => {
        validate(
          ['label.rsk'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        );
      }, {
        name: 'Error',
        message: 'Invalid label: label.rsk',
      });
    });

    it('should throw on invalid owner', () => {
      assert.throws(() => {
        validate(
          ['label'],
          '0x7eff3c48849197b1662365128e63564b457c3a3',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        );
      }, {
        name: 'Error',
        message: 'Invalid owner',
      });
    });

    it('should throw on invalid secret', () => {
      assert.throws(() => {
        validate(
          ['label'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b1662365120'],
          toBN('3'),
        );
      }, {
        name: 'Error',
        message: 'Invalid secret: 0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b1662365120',
      });
    });

    it('should throw on invalid duration', () => {
      assert.throws(() => {
        validate(
          ['label'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          3,
        );
      }, {
        name: 'Error',
        message: 'Invalid duration',
      });
    });

    it('should not throw on valid parameters', () => {
      validate(
        ['label'],
        '0x7eff3c48849197b1662365128e63564b457c3a36',
        ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
        toBN('3'),
      );
    });
  });

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
    });

    it('should create commitments for valid inputs', async () => {
      const labels = ['label', 'label2'];
      const owner = '0x7dbc5395d1cb5f829bc8eca20f16bed7bcecd7bf';
      const secrets = [
        '0xfdf8358dbbbd98fa607e4c0a2635125808dfcb3b5e98b12fe1915e63232423dd',
        '0x7dc8c3c709fe6c154f163ae902f3379677ae184f120a8e887fc8e1cd07532bab',
      ];

      const expected = [
        '0x9f030769dbcbe6047670465514ff96e98618b401447eff2798b7b278ef88ad10',
        '0xad5faf393b9ba60bfb8601dee9a76d8bab630fe3ccea50303919f92dd10ba1c7',
      ];

      const commitments = await makeCommitments(this.fifs.makeCommitment, labels, owner, secrets);

      assert.equal(commitments.length, expected.length);

      for (let i = 0; i < expected.length; i += 1) {
        assert.equal(commitments[i], expected[i]);
      }
    });
  });

  contract('poll commitments', async (accounts) => {
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

      this.batch = await RSKDomainsBatch.new(this.fifs.address);
    });

    it('should reject promise when rest time elapsed', async () => {
      const commitments = await makeCommitments(
        this.fifs.makeCommitment,
        ['label0', 'label1', 'label2', 'label3', 'label4'],
        accounts[0],
        createSecrets(5),
      );

      const commitments2 = await makeCommitments(
        this.fifs.makeCommitment,
        ['label5', 'label6', 'label7', 'label8', 'label9'],
        accounts[0],
        createSecrets(5),
      );

      await this.batch.batchCommit(commitments);
      await this.batch.batchCommit(commitments2);

      await assert.rejects(
        pollUntilCommitted(this.fifs.canReveal, [commitments, commitments2], 60000),
        new Error('Polling timeout'),
      );
    });

    it('should resolve promise when commitment time for all commitments elapsed', async () => {
      const commitments = await makeCommitments(
        this.fifs.makeCommitment,
        ['label0', 'label1', 'label2', 'label3', 'label4'],
        accounts[0],
        createSecrets(5),
      );

      const commitments2 = await makeCommitments(
        this.fifs.makeCommitment,
        ['label5', 'label6', 'label7', 'label8', 'label9'],
        accounts[0],
        createSecrets(5),
      );

      await this.batch.batchCommit(commitments);
      await this.batch.batchCommit(commitments2);

      await time.increase(time.duration.minutes('1'));

      const result = await pollUntilCommitted(this.fifs.canReveal, [commitments, commitments2]);

      assert(result);
    });
  });
});
