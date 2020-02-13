const StringUtils = artifacts.require('StringUtils');

contract('StringUtils - toLowerCase', async () => {
  let stringUtils;

  beforeEach(async () => {
    stringUtils = await StringUtils.new();
  });

  it('should return same string if is already lowerCase', async () => { 
    const text = 'test';
    const result = await stringUtils.toLowerCase(text);
    assert.equal(result, text);
  });

  it('should return lowerCase string when sending upperCase', async () => { 
    const text = 'TEST';
    const result = await stringUtils.toLowerCase(text);
    
    assert.equal(result, text.toLowerCase());
  });

  it('should return lowerCase string when sending mixed upperCase', async () => { 
    const text = 'TeStiNg';
    const result = await stringUtils.toLowerCase(text);
    
    assert.equal(result, text.toLowerCase());
  });

  it('should return lowerCase string when sending mixed upperCase and numbers', async () => { 
    const text = 'TeS1tiN3g0';
    const result = await stringUtils.toLowerCase(text);
    
    assert.equal(result, text.toLowerCase());
  });

  it('should return lowerCase string when sending any character', async () => { 
    const text = 'Te#%*(S1tiN3g0';
    const result = await stringUtils.toLowerCase(text);
    
    assert.equal(result, text.toLowerCase());
  });

  it('should return lowerCase string when sending the entire abc uppercase', async () => { 
    const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const result = await stringUtils.toLowerCase(text);
    
    assert.equal(result, text.toLowerCase());
  });
});