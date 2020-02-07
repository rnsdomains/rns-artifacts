pragma solidity ^0.5.3;

import "@rsksmart/rns-registry/contracts/AbstractRNS.sol";

contract AbstractStringResolver {
    function str(bytes32 node) external view returns (string memory);
    function setStr(bytes32 node, string memory _str) public;

    event NewStr(bytes32 indexed node, string str);
}
