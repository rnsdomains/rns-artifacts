pragma solidity ^0.5.11;

import "@rsksmart/rns-rskregistrar/contracts/FIFSRegistrar.sol";

contract RSKDomainsBatch {
    FIFSRegistrar fifs;

    constructor(FIFSRegistrar _fifs) public {
        fifs = _fifs;
    }

    function batchCommit(bytes32[] calldata commitments) external {
        for (uint i = 0; i < commitments.length; i++) {
            fifs.commit(commitments[i]);
        }
    }
}