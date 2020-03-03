const { createSecrets, validate } = require('../../util/batch/rskDomainsBatchUtils');
const { toBN } = require('web3-utils');
const assert = require('assert');

describe('RSK Domains Batch Utils', () => {
  describe('create secrets', async () => {
    it('should create 10 random secrets', async () => {
      const secrets = createSecrets(10);

      for(let i = 0; i < 10; i+=1) {
        assert.equal(secrets[i].length, 66);
      }
    })
  });

  describe('validate', () => {
    it('should throw on empty label', () => {
      assert.throws(function () {
        validate(
          [''],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        )
      }, {
        name: 'Error',
        message: 'Invalid label: ',
      });
    });

    it('should throw on invalid label', () => {
      assert.throws(function () {
        validate(
          ['&&&'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        )
      }, {
        name: 'Error',
        message: 'Invalid label: &&&',
      });
    });

    it('should throw on label with .', () => {
      assert.throws(function () {
        validate(
          ['label.rsk'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        )
      }, {
        name: 'Error',
        message: 'Invalid label: label.rsk',
      });
    });

    it('should throw on invalid owner', () => {
      assert.throws(function () {
        validate(
          ['label'],
          '0x7eff3c48849197b1662365128e63564b457c3a3',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          toBN('3'),
        )
      }, {
        name: 'Error',
        message: 'Invalid owner',
      });
    })

    it('should throw on invalid secret', () => {
      assert.throws(function () {
        validate(
          ['label'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b1662365120'],
          toBN('3'),
        )
      }, {
        name: 'Error',
        message: 'Invalid secret: 0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b1662365120'
      });
    })

    it('should throw on invalid duration', () => {
      assert.throws(function () {
        validate(
          ['label'],
          '0x7eff3c48849197b1662365128e63564b457c3a36',
          ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
          3,
        )
      }, {
        name: 'Error',
        message: 'Invalid duration',
      });
    })

    it('should not throw on valid parameters', () => {
      validate(
        ['label'],
        '0x7eff3c48849197b1662365128e63564b457c3a36',
        ['0x7eff3c48849197b1662365128e63564b457c3a367eff3c48849197b16623651200'],
        toBN('3'),
      );
    })
  })
})