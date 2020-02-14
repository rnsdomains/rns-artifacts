pragma solidity ^0.5.11;

library StringUtils {

    function toLowerCase(string memory input) public pure returns (string memory out) { 
        assembly {
            let len := mload(input) // Load the length (first 32 bytes)
            mstore(out, len) // set the length of the out array, it will be the same than the input

            let char := 0 // create variable that will contain the current char input the loop
            len := add(0x20, len) // put the ptr on the beggining of the array
            for { let i := 0x20 } lt(i, len) { i := add(i, 1) } {
                char := byte(0, mload(add(input, i))) // char = input[i]
                switch and(gt(char, 0x40), lt(char, 0x5B)) // condition if(char ASCII code is between 65 (0x41) and 90 (0x5A)). Compare with 64 and 91 because there are no >= or <=
                    case 1 {
                        mstore8(add(out, i), add(char, 0x20)) // adds 32 (0x20) to the current char ASCII code. it will make it outcase
                    }
                    default {
                        mstore8(add(out, i), char) // copy the same char because is not upper case
                    }
            }
        }
    }
}