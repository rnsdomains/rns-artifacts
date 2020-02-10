pragma solidity ^0.5.11;

library StringUtils {
  
  function toLowerCase(string memory str) public pure returns (string memory) {
    bytes memory original = bytes(str);
		bytes memory lower = new bytes(original.length);
		
    bytes1 originalCharacter;
    for (uint i = 0; i < original.length; i++) {
      originalCharacter = original[i];
			// upper case characters' ASCII codes are between 65 (0x41) and 90 (0x5A)
			if ((originalCharacter >= 0x41) && (originalCharacter <= 0x5A)) {
				lower[i] = bytes1(uint8(originalCharacter) + 32);
			} else {
				lower[i] = originalCharacter;
			}
		}
		return string(lower);
  }
}