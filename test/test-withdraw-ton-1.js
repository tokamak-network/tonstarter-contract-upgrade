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
let tonStake1, tonStakeUpgrade3, tonStakeUpgrade6, stakingTonRegistry;
let quoter;
let tosAdmin

const vault = "0xf04f6A6D6115D8400D18ECa99BdEe67ABB498a7B";
const tonstarterAdminAddress = "0x15280a52E79FD4aB35F4B9Acbb376DCD72b44Fd1";
const tosAdminAddress = "0x12A936026F072d4e97047696A9d11F97Eae47d21";


const tonStakeProxyAddress1 = "0x9a8294566960Ab244d78D266FFe0f284cDf728F1";
const tonStakeProxyAddress2 = "0x7da4E8Ab0bB29a6772b6231b01ea372994c2A49A";
const tonStakeProxyAddress3 = "0xFC1fC3a05EcdF6B3845391aB5CF6a75aeDef7CeA";
const tonStakeProxyAddress4 = "0x9F97b34161686d60ADB955ed63A2FC0b2eC0a2a9";
const tonStakeProxyAddress5 = "0x21Db1777Dd95749A849d9e244136E72bd93082Ea";
const tonStakeProxyAddress =  tonStakeProxyAddress1;
const registry = "0x4Fa71D6964a97c043CA3103407e1B3CD6b5Ab367";
const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
// const layer2 = "0x42ccf0769e87cb2952634f607df1c7d62e0bbc52";
const layer2 = "0x0F42D1C40b95DF7A1478639918fc358B4aF5298D";

const poolAddress = "0x1c0cE9aAA0c12f53Df3B4d8d77B82D6Ad343b4E4";
const tosAddress = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153";
const tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5";
const wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2";
const tosABI = require("../abis/TOS.json").abi;
const tonStakeABI = require("../abis/TOS.json").abi;
const StakeTONProxyAbi = require("../abis/StakeTONProxy.json").abi;
const StakeTONProxy2Abi = require("../abis/StakeTONProxy2.json").abi;
const TokamakStakeUpgrade3Abi = require("../abis/TokamakStakeUpgrade3.json").abi;
const StakeSimpleAbi = require("../abis/StakeSimple.json").abi;
const ITokamakStakerUpgradeAbi = require("../abis/ITokamakStakerUpgrade.json").abi;
const TokamakStakeUpgrade6Abi = require("../artifacts/contracts/connection/TokamakStakeUpgrade6.sol/TokamakStakeUpgrade6.json").abi;

const UniswapV3PoolAbi = require("../abis/UniswapV3Pool.json").abi;
const RegistryABI = require("../abis/IStakeRegistry.json").abi;
const QuoterABI = require("../abis/Quoter.json").abi;
const Vault1ABI = require("../abis/Stake1Vault.json").abi;
function decimalToHexString(number)
{
    if (number < 0)
    {
    number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

const interfaceRegistry = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ton",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_wton",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_depositManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_seigManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_swapProxy",
        "type": "address"
      }
    ],
    "name": "setTokamak",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
    {
        "inputs": [
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "_router",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_ex1",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_ex2",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_fee",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_routerV2",
            "type": "address"
          }
        ],
        "name": "addDefiInfo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
    {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "defiInfo",
        "outputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "router",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "ext1",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "ext2",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "fee",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "routerV2",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
]

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

    await hre.ethers.provider.send("hardhat_impersonateAccount", [
      tosAdminAddress,
    ]);

     tosAdmin = await ethers.getSigner(tosAdminAddress);
      await hre.ethers.provider.send("hardhat_setBalance", [
          tosAdminAddress,
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

    it("stakingTonRegistry  ", async () => {
        stakingTonRegistry = await ethers.getContractAt(
            interfaceRegistry,
            registry,
            tonstarterAdmin
        );

      });

    // it("tonStakeUpgrade3  ", async () => {
    //   tonStakeUpgrade3 = await ethers.getContractAt(
    //     TokamakStakeUpgrade3Abi,
    //     tonStakeProxyAddress,
    //     provider
    //   );
    //   console.log("tonStakeUpgrade3, ", tonStakeUpgrade3.address);
    // });

    it("tonStake1  ", async () => {
      tonStake1 = await ethers.getContractAt(
        StakeTONProxy2Abi,
        tonStakeProxyAddress,
        provider
      );
    });

    it("      pass time", async function () {
        let endBlock = 20165180;
        let block = await ethers.provider.getBlock('latest')
        console.log('block ', block.number)

        // ethers.provider.send("evm_increaseTime", [60*60*24*365*3])
        let len = endBlock-block.number+4;
        console.log('len ', len)
        let hexLen = "0x"+decimalToHexString(len);
        console.log('decimalToHexString ', hexLen)

        // mine len blocks
        await hre.network.provider.send("hardhat_mine", [hexLen]);

        let block1 = await ethers.provider.getBlock('latest')

        // console.log('block ', block1.number)
    });

    it("change the seigManager of StakeRegistry ", async function () {

      const _depositManager = "0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e"
      const _seigManager = "0x0b55a0f463b6defb81c6063973763951712d0e5f"
      const _swapProxy = "0x30e65B3A6e6868F044944Aa0e9C5d52F8dcb138d"

      await (await stakingTonRegistry.connect(tonstarterAdmin).setTokamak(
        tonAddress,
        wtonAddress,
        _depositManager,
        _seigManager,
        _swapProxy
      )).wait()

    });

    it("      pass blocks", async function () {
        let deplayBlocks = 93046 +20 + 100 ;

        let hexLen = "0x"+decimalToHexString(deplayBlocks);
        await hre.network.provider.send("hardhat_mine", [hexLen]);

    });

    it("withdraw from layer2", async function () {
        const stakeTON = await ethers.getContractAt(
            ITokamakStakerUpgradeAbi,
            tonStakeProxyAddress1,
            provider
        );

        await (await stakeTON.connect(admin1)["tokamakProcessUnStaking(address)"](
            layer2
        )).wait();

    })

    it("withdraw", async function () {
        let tester1 ="0xdabd0cd9c9573c59f5aa0aeef551475ff5a39fa2"
        const stakeTON = await ethers.getContractAt(
            StakeSimpleAbi,
            tonStakeProxyAddress1,
            provider
        );

        await hre.ethers.provider.send("hardhat_impersonateAccount", [
            tester1,
        ]);

        let tester1Account = await ethers.getSigner(tester1);
        await hre.ethers.provider.send("hardhat_setBalance", [
            tester1,
            "0x4EE2D6D415B85ACEF8100000000",
        ]);

        let tester1StakedPrev = await stakeTON.userStaked(tester1);
        let tosBalPrev = await tosContract.balanceOf(tester1)
        let tonBalPrev = await tonContract.balanceOf(tester1)

        await (await stakeTON.connect(tester1Account)["withdraw()"]()).wait()

        let tester1StakedAfter = await stakeTON.userStaked(tester1);
        let tosBalAfter = await tosContract.balanceOf(tester1)
        let tonBalAfter = await tonContract.balanceOf(tester1)

        expect(tester1StakedPrev.released).to.be.eq(false)
        expect(tester1StakedAfter.released).to.be.eq(true)

        expect(tonBalAfter.toString()).to.be.eq(tester1StakedAfter.releasedAmount.add(tonBalPrev).toString())
        expect(tosBalAfter.toString()).to.be.eq(tester1StakedAfter.releasedTOSAmount.add(tosBalPrev).toString())

    });


  });
});
