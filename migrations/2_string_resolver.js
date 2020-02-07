const RNS = artifacts.require('RNS');
const StringResolver = artifacts.require('StringResolver');

module.exports = (deployer, network) => {
  return deployer.then(async () => {
    let registryAddress;

    if (network === 'rskTestnet') {
      registryAddress = '0x7d284aaac6e925aad802a53c0c69efe3764597b8';
    } else if (network === 'rskMainnet') {
      registryAddress = '0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5';
    } else {
      registryAddress = await deployer.deploy(RNS).then(rns => rns.address);
    }

    return deployer.deploy(StringResolver, registryAddress);
  })
}