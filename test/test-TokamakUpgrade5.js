const chai = require("chai");
const Web3EthAbi = require("web3-eth-abi");

require("chai").should();

const hre = require("hardhat");
const { ethers } = require("hardhat");
let accounts, admin1, provider;
let tonstarterAdmin;
let tonContract, tosContract, wtonContract;
let tonStake1, tonStakeUpgrade4, tonStakeUpgrade5;
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


describe("TONStarter TON Upgrade", function () {
  const tonstarterAdminAddress = "0x15280a52E79FD4aB35F4B9Acbb376DCD72b44Fd1";

  before(async () => {
    accounts = await ethers.getSigners();
    [admin1] = accounts;
    console.log("admin1", admin1.address);
    provider = ethers.provider;
    await provider.get
    await hre.ethers.provider.send("hardhat_impersonateAccount", [
      tonstarterAdminAddress,
    ]);

    tonstarterAdmin = await ethers.getSigner(tonstarterAdminAddress);
    await hre.ethers.provider.send("hardhat_setBalance", [
      tonstarterAdmin.address,
      "0x4EE2D6D415B85ACEF8100000000",
    ]);
  });

  describe(" contract  ", () => {
    it("tosContract ", async () => {
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

    it("tonStakeUpgrade4  ", async () => {
      tonStakeUpgrade4 = await ethers.getContractAt(
        TokamakStakeUpgrade4Abi,
        tonStakeProxyAddress,
        provider
      );
      console.log("tonStakeUpgrade4, ", tonStakeUpgrade4.address);
    });

    it("set TokamakStakeUpgrade5 Logic  ", async () => {
      const TokamakStakeUpgrade5 = await ethers.getContractFactory(
        "TokamakStakeUpgrade5"
      );
      const tonStakeUpgrade5 = await TokamakStakeUpgrade5.deploy();
      await tonStakeUpgrade5.deployed();
      console.log("tonStakeUpgrade5:", tonStakeUpgrade5.address);

      //= =================================
      const StakeTONProxy2Contract = await ethers.getContractAt(
        StakeTONProxy2Abi,
        tonStakeProxyAddress,
        provider
      );
      console.log("StakeTONProxy2Contract, ", StakeTONProxy2Contract.address);

      //= =================================
      const tx = await StakeTONProxy2Contract.connect(
        tonstarterAdmin
      ).setImplementation2(tonStakeUpgrade5.address, 3, true);
      console.log("setImplementation2, ", tx.hash);

      await tx.wait();

      //= =================================

      const _exchangeWTONtoTOS = Web3EthAbi.encodeFunctionSignature(
        "exchangeWTONtoTOS(uint256)"
      );

      const _swapWtonToTOS = Web3EthAbi.encodeFunctionSignature(
        "swapWtonToTOS()"
      );
      const _swapTonToWton = Web3EthAbi.encodeFunctionSignature(
        "swapTonToWton()"
      );

      console.log("exchangeWTONtoTOS, ", _exchangeWTONtoTOS );
      console.log("swapWtonToTOS, ", _swapWtonToTOS );
      console.log("swapTonToWton, ", _swapTonToWton );

      const tx1 = await StakeTONProxy2Contract.connect(
        tonstarterAdmin
      ).setSelectorImplementations2(
        [
          _exchangeWTONtoTOS,
          _swapWtonToTOS,
          _swapTonToWton
        ],
        tonStakeUpgrade5.address);


      await tx1.wait();

    });

    it("tonStakeUpgrade5  ", async () => {
      tonStakeUpgrade5 = await ethers.getContractAt(
        TokamakStakeUpgrade5Abi,
        tonStakeProxyAddress,
        provider
      );
      console.log("tonStakeUpgrade5, ", tonStakeUpgrade5.address);
    });

    it("tonStake1  ", async () => {
      tonStake1 = await ethers.getContractAt(
        StakeTONProxy2Abi,
        tonStakeProxyAddress,
        provider
      );
      console.log("tonStake1, ", tonStake1.address);
    });

    it("swap test with tonStakeUpgrade5 ", async () => {

      const amount = ethers.BigNumber.from("25000000000000000000000000000000");
      console.log("스왑하려는 wton 양 ",amount.toString());

      ///---
      const quoter = await ethers.getContractAt(QuoterABI, quoterAddress, provider);
      let _outAmount = await quoter.connect(admin1).callStatic.quoteExactInput(
        encodePath([wtonAddress,tosAddress], [3000]),amount);
      console.log("유니스왑에서 실제 스왑하면 나오는 토스양 _outAmount  ", _outAmount.toString());

      ///--
      const limitPrameters = await tonStakeUpgrade5.connect(admin1)
        .limitPrameters(amount, poolAddress, wtonAddress,tosAddress, ethers.BigNumber.from("18"));
      console.log("현재 스왑시, 허용하는 최저 토스금액 limitPrameters",limitPrameters[0]);

      //---
      // let uniswapPool = await ethers.getContractAt(
      //   UniswapV3PoolAbi,
      //   poolAddress,
      //   provider
      // );

      // let slot = await uniswapPool.slot0();
      // console.log("slot",slot);
      // ------------

      const tx = await tonStakeUpgrade5.connect(admin1)
      .exchangeWTONtoTOS(amount );

      await tx.wait();

      // const _allowanceAfter = await wtonContract.allowance(tonStakeProxyAddress, uniswapRouter);
      // console.log("_allowanceAfter  ", _allowanceAfter.toString());

      const _balance = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("wtonContract _balance, ", tonStakeProxyAddress, _balance.toString());

    });



    it("swapWtonToTOS ", async () => {

      let wtonContractBalance = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("wtonContractBalance _balance, ", tonStakeProxyAddress, wtonContractBalance.toString());


      let tonContractBalance = await tonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("tonContractBalance _balance, ", tonStakeProxyAddress, tonContractBalance.toString());


      const tx = await tonStakeUpgrade5.connect(admin1).swapWtonToTOS();
      await tx.wait();

       wtonContractBalance = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("wtonContractBalance _balance, ", tonStakeProxyAddress, wtonContractBalance.toString());


       tonContractBalance = await tonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("tonContractBalance _balance, ", tonStakeProxyAddress, tonContractBalance.toString());

    });

    it("swapTonToWton ", async () => {

      let wtonContractBalance = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("wtonContractBalance _balance, ", tonStakeProxyAddress, wtonContractBalance.toString());


      let tonContractBalance = await tonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("tonContractBalance _balance, ", tonStakeProxyAddress, tonContractBalance.toString());


      const tx = await tonStakeUpgrade5.connect(admin1).swapTonToWton();
      await tx.wait();

       wtonContractBalance = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("wtonContractBalance _balance, ", tonStakeProxyAddress, wtonContractBalance.toString());



       tonContractBalance = await tonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("tonContractBalance _balance, ", tonStakeProxyAddress, tonContractBalance.toString());

    });
  });
});
