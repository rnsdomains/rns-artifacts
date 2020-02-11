pragma solidity ^0.5.11;

import "./utils/StringUtils.sol";

contract DummyStringUtils {
    using StringUtils for string;

    mapping(bytes32 => string) public nodeStr;


    function str(bytes32 node) external view returns (string memory) {
        return nodeStr[node];
    }

    function setStr(bytes32 node, string calldata newStr) external {
        nodeStr[node] = newStr.toLowerCase();
    }
}
