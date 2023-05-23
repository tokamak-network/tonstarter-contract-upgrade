const chai = require("chai");
const Web3EthAbi = require("web3-eth-abi");

require("chai").should();
const { expect } = require("chai");
const {
  keccak256,
} = require("web3-utils");
const hre = require("hardhat");
const { ethers } = require("hardhat");
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

    it("set TokamakStakeUpgrade6 Logic  ", async () => {
      const TokamakStakeUpgrade6 = await ethers.getContractFactory(
        "TokamakStakeUpgrade6"
      );
      const tonStakeUpgrade6 = await TokamakStakeUpgrade6.deploy();
      let deployedtx = await tonStakeUpgrade6.deployed();
      // console.log("tonStakeUpgrade6:", tonStakeUpgrade6.address);
      // console.log('TokamakStakeUpgrade6 deployed tx', deployedtx)
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
      ).setImplementation2(tonStakeUpgrade6.address, 4, true);
      console.log("setImplementation2, ", tx.hash);

      await tx.wait();

      // let receipt1 = await ethers.provider.getTransactionReceipt(tx.hash)
      // console.log('setImplementation2 tx', receipt1)
      //= =================================

      const _exchangeWTONtoTOS = Web3EthAbi.encodeFunctionSignature(
        "exchangeWTONtoTOS(uint256)"
      );
      const _setChangeTick = Web3EthAbi.encodeFunctionSignature(
        "setChangeTick(int24)"
      );
      const _setQuoter = Web3EthAbi.encodeFunctionSignature(
        "setQuoter(address)"
      );
      const _setAcceptTickIntervalInOracle = Web3EthAbi.encodeFunctionSignature(
        "setAcceptTickIntervalInOracle(int24)"
      );
      const _changeTick = Web3EthAbi.encodeFunctionSignature(
        "changeTick()"
      );
      const _acceptTickIntervalInOracle = Web3EthAbi.encodeFunctionSignature(
        "acceptTickIntervalInOracle()"
      );
      const _consult = Web3EthAbi.encodeFunctionSignature(
        "consult(address,uint32)"
      );

      console.log("exchangeWTONtoTOS, ", _exchangeWTONtoTOS );
      console.log("setChangeTick, ", _setChangeTick );
      console.log("setAcceptTickIntervalInOracle, ", _setAcceptTickIntervalInOracle );
      console.log("setQuoter, ", _setQuoter );
      console.log("changeTick, ", _changeTick );
      console.log("acceptTickIntervalInOracle, ", _acceptTickIntervalInOracle );
      console.log("consult, ", _consult );

      const tx1 = await StakeTONProxy2Contract.connect(
        tonstarterAdmin
      ).setSelectorImplementations2(
        [
          _exchangeWTONtoTOS,_setChangeTick,
          _setAcceptTickIntervalInOracle,_setQuoter,
          _changeTick,_acceptTickIntervalInOracle,_consult
        ],
        tonStakeUpgrade6.address);


      await tx1.wait();

      //  let receipt1 = await ethers.provider.getTransactionReceipt(tx1.hash)
      // console.log('setSelectorImplementations2 tx', receipt1)

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

    it("swap test with tonStakeUpgrade6 ", async () => {
       //-- check the swapable environment
       let UniswapV3Pool =  await ethers.getContractAt(UniswapV3PoolAbi, poolAddress, provider);
       let slot0 = await UniswapV3Pool.slot0();

       let averageTick = await tonStakeUpgrade6.consult(poolAddress,120);
       let acceptTickIntervalInOracle = await tonStakeUpgrade6.acceptTickIntervalInOracle();
       let acceptMaxTick = await tonStakeUpgrade6.acceptMaxTick(averageTick, 60, acceptTickIntervalInOracle)

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
      //_quoteExactInput.toString()
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

      console.log('exchangeWTONtoTOS tx:', tx.hash)


      await tx.wait();

      // let receipt = await ethers.provider.getTransactionReceipt(tx.hash)
      // console.log(receipt)

      const _balanceAfterSwap = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("wtonContract _balanceAfterSwap, ", tonStakeProxyAddress,
      ethers.utils.formatUnits(_balanceAfterSwap, 27) );

    });

    it("setChangeTick  ", async () => {

      let isAdmin = await tonStakeUpgrade6.isAdmin(tonstarterAdmin.address)
      console.log('isAdmin:', isAdmin)

      const tonStakeUpgrade6ByAdmin = await ethers.getContractAt(
        TokamakStakeUpgrade6Abi,
        tonStakeProxyAddress,
        tonstarterAdmin
      );

      await (await tonStakeUpgrade6ByAdmin.connect(tonstarterAdmin).setChangeTick(36)).wait();

      let changeTick = await tonStakeUpgrade6.changeTick();
      console.log('changeTick:', changeTick)

    });

    // it("setAcceptTickIntervalInOracle : user can not excute setAcceptTickIntervalInOracle  ", async () => {

    //   expect(await tonStakeUpgrade6.isAdmin(admin1.address)).to.be.eq(false)

    //   await expect(tonStakeUpgrade6.connect(admin1).setAcceptTickIntervalInOracle(2)).to.be.revertedWith("not admin") ;

    // });

 /*
    it("setAcceptTickIntervalInOracle  ", async () => {

      let isAdmin = await tonStakeUpgrade6.isAdmin(tonstarterAdmin.address)
      console.log('isAdmin:', isAdmin)

      const tonStakeUpgrade6ByAdmin = await ethers.getContractAt(
        TokamakStakeUpgrade6Abi,
        tonStakeProxyAddress,
        tonstarterAdmin
      );

      await (await tonStakeUpgrade6ByAdmin.connect(tonstarterAdmin).setAcceptTickIntervalInOracle(2)).wait();

      let acceptTickIntervalInOracle = await tonStakeUpgrade6.acceptTickIntervalInOracle();
      console.log('acceptTickIntervalInOracle:', acceptTickIntervalInOracle)

    });

    it("      pass time", async function () {

      ethers.provider.send("evm_increaseTime", [60*1])
      ethers.provider.send("evm_mine")
    });
*/
    it("swap test with tonStakeUpgrade6 ", async () => {

      //-- check the swapable environment
      let UniswapV3Pool =  await ethers.getContractAt(UniswapV3PoolAbi, poolAddress, provider);
      let slot0 = await UniswapV3Pool.slot0();

      let averageTick = await tonStakeUpgrade6.consult(poolAddress,120);
      let acceptTickIntervalInOracle = await tonStakeUpgrade6.acceptTickIntervalInOracle();
      let acceptMaxTick = await tonStakeUpgrade6.acceptMaxTick(averageTick, 60, acceptTickIntervalInOracle)

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

      console.log('exchangeWTONtoTOS tx:', tx.hash)


      await tx.wait();

      // let receipt = await ethers.provider.getTransactionReceipt(tx.hash)
      // console.log(receipt)

      const _balanceAfterSwap = await wtonContract.connect(admin1).balanceOf(tonStakeProxyAddress);
      console.log("wtonContract _balanceAfterSwap, ", tonStakeProxyAddress,
      ethers.utils.formatUnits(_balanceAfterSwap, 27) );

    });

  });
});
