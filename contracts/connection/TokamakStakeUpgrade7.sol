// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../stake/StakeTONStorage.sol";
import "../common/AccessibleCommon.sol";
import "../stake/StakeQuoterStorage.sol";

/// @title The connector that integrates tokamak
contract TokamakStakeUpgrade7 is
    StakeTONStorage,
    AccessibleCommon,
    StakeQuoterStorage
{

    function changeAddresses(address _depositManager, address _seigManager, address _tokamakLayer2) external onlyOwner {
        require(
            depositManager != depositManager || seigManager != _seigManager || tokamakLayer2 != _tokamakLayer2,
            "same address"
        );

        depositManager = _depositManager;
        seigManager = _seigManager;
        tokamakLayer2 = _tokamakLayer2;
    }

}
