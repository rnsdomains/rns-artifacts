pragma solidity ^0.5.3;

import "@rsksmart/rns-registry/contracts/AbstractRNS.sol";
import "./AbstractStringResolver.sol";

contract StringResolver is AbstractStringResolver {
    AbstractRNS rns;

    mapping(bytes32 => string) public _nodeStr;

    constructor(AbstractRNS _rns) public {
        rns = _rns;
    }

    /// @notice Returns the current str record for a domain.
    /// @param node domain
    /// @return str record
    function str(bytes32 node) external view returns (string memory) {
        return _nodeStr[node];
    }

    /// @notice Sets the str record for a domain.
    /// @dev Only node owner.
    /// @param node domain
    /// @param newStr record value
    function setStr(bytes32 node, string memory newStr) public {
        require(msg.sender == rns.owner(node), "Only node owner.");

        emit NewStr(node, newStr);
        _nodeStr[node] = newStr;
    }
}
