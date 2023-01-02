// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "../common/ProxyAccessCommon.sol";
import "./PublicSaleStorage.sol";
import "../proxy/BaseProxy.sol";

import "../interfaces/IPublicSaleProxy.sol";
import "../interfaces/IPublicSale.sol";
import "../interfaces/IWTON.sol";

import { ERC165Storage } from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract PublicSaleProxy is
    PublicSaleStorage,
    ProxyAccessCommon,
    BaseProxy,
    ERC165Storage,
    IPublicSaleProxy
{
    constructor() {
        bytes4 OnApproveSelector= bytes4(keccak256("onApprove(address,address,uint256,bytes)"));

        _registerInterface(OnApproveSelector);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165Storage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @dev Initialize
    function initialize(
        address _saleTokenAddress,
        address _getTokenOwner,
        address _vaultAddress
    ) external override onlyProxyOwner {
        require(startAddWhiteTime == 0, "possible to setting the whiteTime before");
        saleToken = IERC20(_saleTokenAddress);
        getTokenOwner = _getTokenOwner;
        liquidityVaultAddress = _vaultAddress;
        deployTime = block.timestamp;
    }

    function changeBasicSet(
        address _getTokenAddress,
        address _sTOS,
        address _wton,
        address _uniswapRouter,
        address _TOS
    ) external override onlyProxyOwner {
        require(startAddWhiteTime == 0, "possible to setting the whiteTime before");
        getToken = _getTokenAddress;
        sTOS = ILockTOS(_sTOS);
        wton = _wton;
        uniswapRouter = ISwapRouter(_uniswapRouter);
        tos = IERC20(_TOS);
        IERC20(wton).approve(
            address(uniswapRouter),
            type(uint256).max
        );
        IERC20(getToken).approve(
            wton,
            type(uint256).max
        );
    }

    function setMaxMinPercent(
        uint256 _min,
        uint256 _max
    ) external override onlyProxyOwner {
        require(_min < _max, "need min < max");
        minPer = _min;
        maxPer = _max;
    }

    function setSTOSstandard(
        uint256 _tier1,
        uint256 _tier2,
        uint256 _tier3,
        uint256 _tier4
    ) external override onlyProxyOwner {
        require(
            (_tier1 < _tier2) &&
            (_tier2 < _tier3) &&
            (_tier3 < _tier4),
            "tier set error"
        );
        stanTier1 = _tier1;
        stanTier2 = _tier2;
        stanTier3 = _tier3;
        stanTier4 = _tier4;
    }

    function setDelayTime(
        uint256 _delay
    ) external override onlyProxyOwner {
        delayTime = _delay;
    }

    // function onApprove(
    //     address sender,
    //     address spender,
    //     uint256 amount,
    //     bytes calldata data
    // ) external override returns (bool) {
    //     require(msg.sender == address(getToken) || msg.sender == address(IWTON(wton)), "PublicSale: only accept TON and WTON approve callback");
    //     if(msg.sender == address(getToken)) {
    //         uint256 wtonAmount = IPublicSale(address(this))._decodeApproveData(data);
    //         if(wtonAmount == 0){
    //             if(block.timestamp >= startExclusiveTime && block.timestamp < endExclusiveTime) {
    //                 IPublicSale(address(this)).exclusiveSale(sender,amount);
    //             } else {
    //                 require(block.timestamp >= startDepositTime && block.timestamp < endDepositTime, "PublicSale: not SaleTime");
    //                 IPublicSale(address(this)).deposit(sender,amount);
    //             }
    //         } else {
    //             uint256 totalAmount = amount + wtonAmount;
    //             if(block.timestamp >= startExclusiveTime && block.timestamp < endExclusiveTime) {
    //                 IPublicSale(address(this)).exclusiveSale(sender,totalAmount);
    //             }
    //             else {
    //                 require(block.timestamp >= startDepositTime && block.timestamp < endDepositTime, "PublicSale: not SaleTime");
    //                 IPublicSale(address(this)).deposit(sender,totalAmount);
    //             }
    //         }
    //     } else if (msg.sender == address(IWTON(wton))) {
    //         uint256 wtonAmount = IPublicSale(address(this))._toWAD(amount);
    //         if(block.timestamp >= startExclusiveTime && block.timestamp < endExclusiveTime) {
    //             IPublicSale(address(this)).exclusiveSale(sender,wtonAmount);
    //         }
    //         else {
    //             require(block.timestamp >= startDepositTime && block.timestamp < endDepositTime, "PublicSale: not SaleTime");
    //             IPublicSale(address(this)).deposit(sender,wtonAmount);
    //         }
    //     }

    //     return true;
    // }
}