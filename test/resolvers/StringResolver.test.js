const RNS = artifacts.require('RNS');
const StringResolver = artifacts.require('StringResolver');
const assert = require('assert');

const namehash = require('eth-ens-namehash');
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract('StringResolver', async (accounts) => {
  const rootNode = namehash.hash('rsk');

  beforeEach(async () => {
    this.rns = await RNS.new();
    this.stringResolver = await StringResolver.new(this.rns.address);

    await this.rns.setSubnodeOwner('0x00', web3.utils.sha3('rsk'), accounts[0]);
  });

  it('should allow owner to set str', async () => {
    const str = 'rif communications!';

    await this.stringResolver.setStr(rootNode, str);

    assert.equal(await this.stringResolver.str(rootNode), str);
  });

  it('should emit NewStr event', async () => {
    const str = 'rif communications!';

    await expectEvent(
      await this.stringResolver.setStr(rootNode, str),
      'NewStr',
      {
        node: rootNode,
        str,
      },
    );
  });

  it('should not allow not owner to set str', async () => {
    const str = 'trying to attack';

    await expectRevert(
      this.stringResolver.setStr(rootNode, str, { from: accounts[1] }),
      'Only node owner.',
    );
  });
});
