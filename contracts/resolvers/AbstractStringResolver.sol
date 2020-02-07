pragma solidity ^0.5.11;

import "@rsksmart/rns-registry/contracts/AbstractRNS.sol";

contract AbstractStringResolver {
    function str(bytes32 node) external view returns (string memory);
    function setStr(bytes32 node, string calldata _str) external;

    event NewStr(bytes32 indexed node, string str);
}
