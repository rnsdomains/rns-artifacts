const StringUtils = artifacts.require('StringUtils');

const expect = require('chai').expect;
const helpers = require('@openzeppelin/test-helpers');

contract('StringUtils - toLoweCase', async () => {
  let stringUtils;

  beforeEach(async () => {
    stringUtils = await StringUtils.new();
  });

  it('should return same string if is already lowerCase', async () => { 
    const text = 'test';
    const result = await stringUtils.toLowerCase(text);
    
    expect(result).equal(text);
  });

  it('should return lowerCase string when sending upperCase', async () => { 
    const text = 'TEST';
    const result = await stringUtils.toLowerCase(text);
    
    expect(result).equal(text.toLowerCase());
  });

  it('should return lowerCase string when sending mixed upperCase', async () => { 
    const text = 'TeStiNg';
    const result = await stringUtils.toLowerCase(text);
    
    expect(result).equal(text.toLowerCase());
  });

  it('should return lowerCase string when sending mixed upperCase and numbers', async () => { 
    const text = 'TeS1tiN3g0';
    const result = await stringUtils.toLowerCase(text);
    
    expect(result).equal(text.toLowerCase());
  });
});