const StringUtils = artifacts.require('StringUtils');
const DummyStringUtils = artifacts.require('DummyStringUtils');
const namehash = require('eth-ens-namehash');

contract('DummyStringUtils - toLowerCase', async () => {
  let stringUtils, dummyStringUtils, text;
  const node = namehash.hash('rsk');


  beforeEach(async () => {
    stringUtils = await StringUtils.new();
    await DummyStringUtils.link('StringUtils', stringUtils.address);
    dummyStringUtils = await DummyStringUtils.new();
  });

  it('should set a lowerCase string', async () => { 
    text = 'test';
    await dummyStringUtils.setStr(node, text);

    assert.equal(await dummyStringUtils.str(node), text.toLowerCase());
  });

  it('should return lowerCase string when sending upperCase', async () => { 
    text = 'TEST';
    await dummyStringUtils.setStr(node, text);

    assert.equal(await dummyStringUtils.str(node), text.toLowerCase());
  });

  it('should return lowerCase string when sending mixed upperCase', async () => { 
    text = 'TeStiNg';
    await dummyStringUtils.setStr(node, text);

    assert.equal(await dummyStringUtils.str(node), text.toLowerCase());
  });

  it('should return lowerCase string when sending mixed upperCase and numbers', async () => { 
    text = 'TeS1tiN3g0';
    await dummyStringUtils.setStr(node, text);

    assert.equal(await dummyStringUtils.str(node), text.toLowerCase());
  });

  it('should return lowerCase string when sending any character', async () => { 
    const text = 'Te#%*(S1tiN3g0';
    await dummyStringUtils.setStr(node, text);

    assert.equal(await dummyStringUtils.str(node), text.toLowerCase());
  });

  it('should return lowerCase string when sending the entire abc uppercase', async () => { 
    const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    await dummyStringUtils.setStr(node, text);

    assert.equal(await dummyStringUtils.str(node), text.toLowerCase());
  });

  it('should return lowerCase string when sending a large string', async () => { 
    const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ';
    await dummyStringUtils.setStr(node, text);

    assert.equal(await dummyStringUtils.str(node), text.toLowerCase());
  });
});