pragma solidity ^0.5.11;

contract Migrations {
    address public owner;
    uint public lastCompletedMigration;

    constructor() public {
        owner = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == owner, "Restricted")
        _;
    }

    function setCompleted(uint completed) external restricted {
        lastCompletedMigration = completed;
    }
}
