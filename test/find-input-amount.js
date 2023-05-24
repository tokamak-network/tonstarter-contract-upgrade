const chai = require("chai");
const Web3EthAbi = require("web3-eth-abi");

require("chai").should();
const { expect } = require("chai");
const {
  keccak256,
} = require("web3-utils");
const hre = require("hardhat");
const { ethers } = require("hardhat");
const univ3prices = require('@thanpolas/univ3prices');


let accounts, admin1, provider;
let tonstarterAdmin;
let tonContract, tosContract, wtonContract;
let tonStake1, tonStakeUpgrade6;
let quoter;

const tonStakeProxyAddress = "0x9a8294566960Ab244d78D266FFe0f284cDf728F1";
const registry = "0x4Fa71D6964a97c043CA3103407e1B3CD6b5Ab367";
const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

const poolAddress = "0x1c0cE9aAA0c12f53Df3B4d8d77B82D6Ad343b4E4";
const tosAddress = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153";
const tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5";
const wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2";
const tosABI = require("../abis/TOS.json").abi;
const tonStakeABI = require("../abis/TOS.json").abi;
const StakeTONProxyAbi = require("../abis/StakeTONProxy.json").abi;
const StakeTONProxy2Abi = require("../abis/StakeTONProxy2.json").abi;
const TokamakStakeUpgrade4Abi = require("../abis/TokamakStakeUpgrade4.json").abi;
const TokamakStakeUpgrade5Abi = require("../artifacts/contracts/connection/TokamakStakeUpgrade5.sol/TokamakStakeUpgrade5.json").abi;
const TokamakStakeUpgrade6Abi = require("../artifacts/contracts/connection/TokamakStakeUpgrade6.sol/TokamakStakeUpgrade6.json").abi;

const UniswapV3PoolAbi = require("../abis/UniswapV3Pool.json").abi;
const RegistryABI = require("../abis/IStakeRegistry.json").abi;
const QuoterABI = require("../abis/Quoter.json").abi;

const interfaceABI = [
  {
    inputs: [],
    name: "getPoolAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "exchangeWTONtoTOS",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        internalType: "int24",
        name: "acceptTickCounts",
        type: "int24",
      },
    ],
    name: "limitPrameters",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOutMinimum",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "priceLimit",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "sqrtPriceX96Limit",
        type: "uint160",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];


const ADDR_SIZE = 20
const FEE_SIZE = 3
const OFFSET = ADDR_SIZE + FEE_SIZE
const DATA_SIZE = OFFSET + ADDR_SIZE
function position(tick)   {
  // wordPos = int16(tick >> 8);
  // bitPos = uint8(tick % 256);

  wordPos = (tick >> 8);
  console.log('wordPos', wordPos)
  bitPos =  (tick % 256);
  console.log('bitPos', bitPos)
  return (wordPos, bitPos)
}

function encodePath(path, fees) {
  if (path.length != fees.length + 1) {
    throw new Error('path/fee lengths do not match')
  }

  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2)
    // 3 byte encoding of the fee
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
  }
  // encode the final token
  encoded += path[path.length - 1].slice(2)

  return encoded.toLowerCase()
}


describe("Find Input Amount for Specific Price Impact ", function () {

  before(async () => {
    accounts = await ethers.getSigners();
    [admin1] = accounts;
    console.log("admin1", admin1.address);
    provider = ethers.provider;
    await provider.get

  });

  describe(" contract  ", () => {

    it("tosContract ", async () => {

      console.log("PHASE1.SWAPTOS.BURNPERCENT", keccak256("PHASE1.SWAPTOS.BURNPERCENT"))

      tosContract = await ethers.getContractAt(tosABI, tosAddress, provider);
      console.log("tosContract, ", tosContract.address);
    });
    it("tonContract ", async () => {
      tonContract = await ethers.getContractAt(tosABI, tonAddress, provider);
      console.log("tonContract, ", tonContract.address);
    });

    it("wtonContract ", async () => {
      wtonContract = await ethers.getContractAt(tosABI, wtonAddress, admin1);
      console.log("wtonContract, ", wtonContract.address);

      const _balance = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("_balance, ", tonStakeProxyAddress, _balance.toString());
    });

    it("tonStakeUpgrade6  ", async () => {
      tonStakeUpgrade6 = await ethers.getContractAt(
        TokamakStakeUpgrade6Abi,
        tonStakeProxyAddress,
        provider
      );
      console.log("tonStakeUpgrade6, ", tonStakeUpgrade6.address);
    });

    it("tonStake1  ", async () => {
      tonStake1 = await ethers.getContractAt(
        StakeTONProxy2Abi,
        tonStakeProxyAddress,
        provider
      );
      console.log("tonStake1, ", tonStake1.address);

    });

    it("Find WTON amount providing at current price range", async () => {
        console.log('poolAddress', poolAddress);

        let UniswapV3Pool =  await ethers.getContractAt(UniswapV3PoolAbi, poolAddress, provider);
        let slot0 = await UniswapV3Pool.slot0();

        let currentLiquidity= await UniswapV3Pool.liquidity();
        let sqrtRatioAX96 = univ3prices.tickMath.getSqrtRatioAtTick(slot0.tick);
        let sqrtRatioBX96 = univ3prices.tickMath.getSqrtRatioAtTick(slot0.tick+60);

        const reserves = univ3prices.getAmountsForLiquidityRange(
                slot0.sqrtPriceX96.toString(),
                sqrtRatioAX96,
                sqrtRatioBX96,
                currentLiquidity.toString(),
            );

        let reserve0 = ethers.BigNumber.from(reserves[0].toString());
        console.log('expected TOS amount ',ethers.utils.formatUnits(reserve0, 18) , 'TOS');

        ///---
        const quoter = await ethers.getContractAt(QuoterABI, quoterAddress, provider);

        let _quoteExactOut = await quoter.callStatic.quoteExactOutput(
          encodePath([tosAddress, wtonAddress], [3000]),
          reserve0
        );
        console.log('_quoteExactOut',ethers.utils.formatUnits(_quoteExactOut, 27) , 'WTON');
    })


  });
});
