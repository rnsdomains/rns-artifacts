pragma solidity ^0.5.11;

import "@rsksmart/rns-rskregistrar/contracts/FIFSRegistrar.sol";
import "@rsksmart/erc677/contracts/IERC677.sol";
import "@rsksmart/erc677/contracts/ERC677TransferReceiver.sol";
import "solidity-rlp/contracts/RLPReader.sol";

contract RSKDomainsBatch is ERC677TransferReceiver {
    FIFSRegistrar fifs;
    IERC677 rif;

    using RLPReader for RLPReader.RLPItem;
    using RLPReader for RLPReader.Iterator;
    using RLPReader for bytes;

    constructor(FIFSRegistrar _fifs, IERC677 _rif) public {
        fifs = _fifs;
        rif = _rif;
    }

    function batchCommit(bytes32[] calldata commitments) external {
        for (uint i = 0; i < commitments.length; i++) {
            fifs.commit(commitments[i]);
        }
    }

    function tokenFallback(address from, uint value, bytes calldata data) external returns(bool) {
        RLPReader.RLPItem[] memory ls = data.toRlpItem().toList();

        uint price = ls[0].toUint();
        RLPReader.Iterator memory iter = ls[1].iterator();

        while(iter.hasNext()) {
            require(
                rif.transferAndCall(address(fifs), price, iter.next().toBytes()),
                "Register error"
            );
        }

        return true;
    }
}
