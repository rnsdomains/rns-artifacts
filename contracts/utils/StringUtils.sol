pragma solidity ^0.5.11;

library StringUtils {

    function toLowerCase(string memory str) public pure returns (string memory) { 
        bytes memory original = bytes(str);
        bytes memory lower;

        assembly {
            let len := mload(original) // Load the length (first 32 bytes)
            lower := mload(0x40) // 0x40 is the address where next free memory slot is stored in Solidity.
            mstore(lower, len) // set the length of the lower array, it will be the same than the original
            let character := 0
            for { let i := 0 } lt(i, len) { i := add(i, 1) } {
                character := byte(0, mload(add(original, add(0x20, i)))) // character = original[i], data offset = 0x20 (1st 32 is reserved for size) + i to pickup the right index
                switch and(gt(character, 0x40), lt(character, 0x5B)) // condition if(character ASCII code is between 65 (0x41) and 90 (0x5A)). Compare with 64 and 91 because there are no >= or <=
                    case 1 {
                        mstore8(add(lower, add(0x20, i)), add(character, 0x20)) // adds 32 (0x20) to the current character ASCII code. it will make it lowercase
                    }
                    default {
                        mstore8(add(lower, add(0x20, i)), character) // copy the same character because is not upper case
                    }
            }
            mstore(0x40, add(lower, add(0x20, len))) // set lower array
        }

        return string(lower);
    }
}