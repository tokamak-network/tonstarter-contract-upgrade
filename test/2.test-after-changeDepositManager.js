const chai = require("chai")
const { solidity } = require("ethereum-waffle")
chai.use(solidity)
require("chai").should();
const { expect } = require("chai");

const Web3EthAbi = require("web3-eth-abi");
const { mine } = require("@nomicfoundation/hardhat-network-helpers")

// const { expect } = require("chai");
const {
  keccak256,
} = require("web3-utils");
const hre = require("hardhat");
const { ethers } = require("hardhat");
let accounts, admin1, provider;
let tonstarterAdmin;
let tonContract, tosContract, wtonContract;
let tonStake1, tonStakeUpgrade6,  tonStakeUpgrade7, stakeContract;
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

const DepositManagerAbi = require("../abis/DepositManager.json").abi;
const SeigManagerAbi = require("../abis/SeigManager.json").abi;

const TokamakStakeUpgradeAbi = require("../abis/TokamakStakeUpgrade.json").abi;
const TokamakStakeUpgrade4Abi = require("../abis/TokamakStakeUpgrade4.json").abi;
const TokamakStakeUpgrade5Abi = require("../artifacts/contracts/connection/TokamakStakeUpgrade5.sol/TokamakStakeUpgrade5.json").abi;
const TokamakStakeUpgrade6Abi = require("../artifacts/contracts/connection/TokamakStakeUpgrade6.sol/TokamakStakeUpgrade6.json").abi;
const TokamakStakeUpgrade7Abi = require("../artifacts/contracts/connection/TokamakStakeUpgrade7.sol/TokamakStakeUpgrade7.json").abi;


const UniswapV3PoolAbi = require("../abis/UniswapV3Pool.json").abi;
const RegistryABI = require("../abis/IStakeRegistry.json").abi;
const QuoterABI = require("../abis/Quoter.json").abi;

const tokamakAddress = {
    depositManager: "0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e",
    seigManager: "0x0b55a0f463b6defb81c6063973763951712d0e5f",
    newLayer2: "0x0F42D1C40b95DF7A1478639918fc358B4aF5298D",
    oldLayer2: "0x42ccf0769e87cb2952634f607df1c7d62e0bbc52"
}

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

function compareRayBalance(val1, val2) {
  if(val1.gt(val2)) {
    if(val1.sub(val2).lte(ethers.BigNumber.from("1000")) ) return true;
    else return false;
  } else if(val2.gt(val1)) {
    if(val2.sub(val1).lte(ethers.BigNumber.from("1000")) ) return true;
    else return false;
  } else {
    return true
  }
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

describe("TONStarter TON #1 Test", function () {
  before(async () => {
    accounts = await ethers.getSigners();
    [admin1] = accounts;
    // console.log("admin1", admin1.address);
    provider = ethers.provider;
    await provider.get

  });

  describe(" contract  ", () => {

    it("tosContract ", async () => {
        tosContract = await ethers.getContractAt(tosABI, tosAddress, provider);
        // console.log("tosContract, ", tosContract.address);
    });

    it("tonContract ", async () => {
        tonContract = await ethers.getContractAt(tosABI, tonAddress, provider);
        // console.log("tonContract, ", tonContract.address);
    });

    it("wtonContract ", async () => {
        wtonContract = await ethers.getContractAt(tosABI, wtonAddress, admin1);
        // console.log("wtonContract, ", wtonContract.address);
    });

    it("Manage > Unstake from Layer2", async () => {

        let canTokamakRequestUnStaking = await stakeContract.canTokamakRequestUnStaking(tokamakAddress.newLayer2)

        const receipt = await (await stakeContract.connect(admin1).tokamakRequestUnStaking(
          tokamakAddress.newLayer2,
          canTokamakRequestUnStaking
        )).wait()

        const topic = stakeContract.interface.getEventTopic('TokamakRequestedUnStaking');
        const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
        const deployedEvent = stakeContract.interface.parseLog(log);
        // console.log('deployedEvent', deployedEvent.args)
        expect(deployedEvent.args.layer2).to.be.eq(tokamakAddress.newLayer2)
        expect(compareRayBalance(deployedEvent.args.amount,canTokamakRequestUnStaking)).to.be.eq(true)

        expect(
          compareRayBalance(await stakeContract.canTokamakRequestUnStaking(tokamakAddress.newLayer2),
          ethers.constants.Zero)
          ).to.be.eq(true)
    });

    it("mine ", async () => {

        let depositManagerV2 = await ethers.getContractAt(DepositManagerAbi, tokamakAddress.depositManager, provider)
        let globalWithdrawalDelay = await depositManagerV2.globalWithdrawalDelay()
        await mine(globalWithdrawalDelay, { interval: 12 });

    });

    it("Manage > Withdraw ", async () => {

        // const prevBalanceOfWton = await wtonContract.balanceOf(tonStakeProxyAddress);
        const prevBalanceOfTon = await tonContract.balanceOf(tonStakeProxyAddress);

        const receipt = await (await stakeContract.connect(admin1).tokamakProcessUnStaking(
          tokamakAddress.newLayer2
        )).wait()

        const topic = stakeContract.interface.getEventTopic('TokamakProcessedUnStaking');
        const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
        const deployedEvent = stakeContract.interface.parseLog(log);
        // console.log(deployedEvent.args)

        // const afterbalanceOfWton = await wtonContract.balanceOf(tonStakeProxyAddress);
        const afterBalanceOfTon = await tonContract.balanceOf(tonStakeProxyAddress);

        expect(afterBalanceOfTon).to.be.gt(prevBalanceOfTon)
    });

    it("Manage > Swap ", async () => {

      //-- check the swapable environment
      let UniswapV3Pool =  await ethers.getContractAt(UniswapV3PoolAbi, poolAddress, provider);
      let slot0 = await UniswapV3Pool.slot0();

      let averageTick = await tonStakeUpgrade6.consult(poolAddress, 120);
      let acceptTickIntervalInOracle = await tonStakeUpgrade6.acceptTickIntervalInOracle();
      let acceptMaxTick = await tonStakeUpgrade6.acceptMaxTick(averageTick, 60, acceptTickIntervalInOracle)
      // console.log('averageTick', averageTick)
      // console.log('acceptMaxTick', acceptMaxTick)
      // console.log('slot0.tick', slot0.tick)

      let changeTick = await tonStakeUpgrade6.changeTick();
      if (changeTick == 0) changeTick = 18;

      if(slot0.tick > acceptMaxTick) {
        console.log('The current price is greater than the average price over the last 2 minutes. Swap is not supported in this environment.')
        return ;
      }


      // 현재 보유하고 있는 wton 의 잔액 (톤을 포함)
      let balanceWTON = await wtonContract.balanceOf(tonStakeProxyAddress);
      console.log('balanceWTON',balanceWTON)

      let balanceTON = await tonContract.balanceOf(tonStakeProxyAddress);
      console.log('balanceTON',balanceTON)

      // 스왑하려는 wton 양을 찿는다.
      let totalBalance = balanceWTON.add(balanceTON.mul(ethers.BigNumber.from("1000000000")))
      let amount = totalBalance;
      console.log("the amount of WTON to swap ", ethers.utils.formatUnits(amount, 27) ,"WTON");

      ///---
      const quoter = await ethers.getContractAt(QuoterABI, quoterAddress, provider);
      let _quoteExactInput = await quoter.connect(admin1).callStatic.quoteExactInput(
        encodePath([wtonAddress,tosAddress], [3000]), amount);
      console.log("The amount of TOS swapped when you actually swap in Uniswap : _quoteExactInput  ",
        ethers.utils.formatUnits(_quoteExactInput, 18) , 'TOS'
      );

      ///--
      const limitPrameters = await tonStakeUpgrade6.connect(admin1)
        .limitPrameters(amount, poolAddress, wtonAddress, tosAddress, changeTick);

      console.log("Minimum swap amount allowed : limitPrameters", ethers.utils.formatUnits(limitPrameters[0], 18), 'TOS' );

      let _quoteExactInput1 = await quoter.connect(admin1).callStatic.quoteExactInputSingle(
        wtonAddress,
        tosAddress,
        3000,
        amount,
        limitPrameters[2]);

      console.log("_quoteExactInput1  ",  ethers.utils.formatUnits(_quoteExactInput1, 18) , 'TOS');


      if (limitPrameters[0].gt(_quoteExactInput)) { // re-calculate amount what want to swap

        let _quoteExactOut = await quoter.connect(admin1).callStatic.quoteExactOutput(
          encodePath([tosAddress, wtonAddress], [3000]),
          _quoteExactInput1.mul(ethers.BigNumber.from("10005")).div(ethers.BigNumber.from("10000"))
          );

          console.log("re-calculate the input amount of WTON to swap ", ethers.utils.formatUnits(_quoteExactOut, 27), "WTON");
          amount = _quoteExactOut;
      }

      // swap
      const tx = await tonStakeUpgrade6.connect(admin1).exchangeWTONtoTOS(amount);

      // console.log('exchangeWTONtoTOS tx:', tx.hash)


      await tx.wait();

      // let receipt = await ethers.provider.getTransactionReceipt(tx.hash)
      // console.log(receipt)

      const _balanceAfterSwap = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("wtonContract _balanceAfterSwap, ", tonStakeProxyAddress,
      ethers.utils.formatUnits(_balanceAfterSwap, 27) );

    });

  });
});
