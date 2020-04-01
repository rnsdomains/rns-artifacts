const ERC677 = artifacts.require('ERC677');
const RNS = artifacts.require('RNS');
const NodeOwner = artifacts.require('NodeOwner');
const NamePrice = artifacts.require('NamePrice');
const BytesUtils = artifacts.require('BytesUtils');
const FIFSRegistrar = artifacts.require('FIFSRegistrar');
const RSKDomainsBatch = artifacts.require('RSKDomainsBatch');

const namehash = require('eth-ens-namehash');

module.exports = (deployer, network, accounts) => {
  return deployer.then(async () => {
    let fifsAddress, rifAddress;

    if (network === 'rskTestnet') {
      fifsAddress = '0x36ffda909f941950a552011f2c50569fda14a169';
      rifAddress = '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe';
    } else if (network === 'rskMainnet') {
      fifsAddress = '0x779195c53cc7c1a33bd2eea5f63f2c1da8798d61';
      rifAddress = '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5';
    } else {
      const rif = await ERC677.new(
        accounts[0],
        web3.utils.toBN('1000000000000000000000000'),
        'RIF',
        'RIF',
        web3.utils.toBN('18'),
      );

      const rootNode = namehash.hash('rsk');

      const rns = await RNS.new();

      const nodeOwner = await NodeOwner.new(rns.address, rootNode);
      await rns.setSubnodeOwner('0x00', web3.utils.sha3('rsk'), nodeOwner.address);

      const namePrice = await NamePrice.new();

      const bytesUtils = await BytesUtils.new();
      await FIFSRegistrar.link('BytesUtils', bytesUtils.address);

      const fifs = await FIFSRegistrar.new(
        rif.address,
        nodeOwner.address,
        accounts[1],
        namePrice.address,
      );
      await nodeOwner.addRegistrar(fifs.address);

      fifsAddress = fifs.address;
      rifAddress = rif.address;
    }

    return deployer.deploy(RSKDomainsBatch, fifsAddress, rifAddress);
  });
}
