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
const layer2 = "0x42ccf0769e87cb2952634f607df1c7d62e0bbc52";
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
        console.log("stakingTonRegistry, ", stakingTonRegistry.address);
      });

    it("tonStakeUpgrade3  ", async () => {
      tonStakeUpgrade3 = await ethers.getContractAt(
        TokamakStakeUpgrade3Abi,
        tonStakeProxyAddress,
        provider
      );
      console.log("tonStakeUpgrade3, ", tonStakeUpgrade3.address);
    });

    it("tonStake1  ", async () => {
      tonStake1 = await ethers.getContractAt(
        StakeTONProxy2Abi,
        tonStakeProxyAddress,
        provider
      );
      console.log("tonStake1, ", tonStake1.address);

    });

    it("burnPercentage  ", async () => {
        let name = keccak256("PHASE1.SWAPTOS.BURNPERCENT")
        console.log("PHASE1.SWAPTOS.BURNPERCENT, ", name);
        let burnPercentage = await stakingTonRegistry.connect(admin1).defiInfo(name);
        console.log("burnPercentage, ", burnPercentage);

    });

    it("StakeTON #5 infos ", async () => {
        const stakeTON  = await ethers.getContractAt(
            TokamakStakeUpgrade3Abi,
            tonStakeProxyAddress5,
            provider
        );

        let tonBalance = await tonContract.balanceOf(tonStakeProxyAddress5);
        let wtonBalance = await wtonContract.balanceOf(tonStakeProxyAddress5);
        let tosBalance = await tosContract.balanceOf(tonStakeProxyAddress5);
        console.log("TON balance of StakeTON #5 ", ethers.utils.formatUnits(tonBalance, 18) , " TON") ;
        console.log("WTON balance of StakeTON #5 ", ethers.utils.formatUnits(wtonBalance, 27), " WTON") ;
        console.log("TOS balance of StakeTON #5 ", ethers.utils.formatUnits(tosBalance, 18), " TOS") ;


        let infos = await stakeTON.infos();

        console.log("rewardClaimedTotal ", ethers.utils.formatUnits(infos[3], 18) , " TON" ) ;
        console.log("totalStakedAmount ", ethers.utils.formatUnits(infos[4], 18) , " TON") ;
        console.log("totalStakers ", infos[5]) ;

        const vault1 = await ethers.getContractAt(
            Vault1ABI,
            vault,
            provider
        );
        let rewardTotal = await vault1.totalRewardAmount(tonStakeProxyAddress5);
        console.log("rewardTotal ", ethers.utils.formatUnits(rewardTotal, 18) , " TOS") ;

        console.log("아직 남아 있는 리워드 (withdraw 아직 안함.) ",  ethers.utils.formatUnits(rewardTotal.sub(infos[3]), 18)  , " TOS") ;
            /*
        let tester1 ="0x36f917bbd70d31f0501fce2cd1756a977d783e44"
        let tester2 ="0xe12ea99b2a6603ec19e3138a92d8f0101a588031"
        let tester3 ="0x149b1deba845f6bc10e012450870b3ffd7eeabea"

        let tester1Staked = await stakeTON.userStaked(tester1);
        console.log("tester1Staked ", tester1Staked) ;
        let tester2Staked = await stakeTON.userStaked(tester2);
        console.log("tester2Staked ", tester2Staked) ;

        let tester3Staked = await stakeTON.userStaked(tester3);
        console.log("tester3Staked ", tester3Staked) ;
        */
    })


    it("StakeTON #4 infos ", async () => {
        const stakeTON = await ethers.getContractAt(
            TokamakStakeUpgrade3Abi,
            tonStakeProxyAddress4,
            provider
        );

        let tonBalance = await tonContract.balanceOf(tonStakeProxyAddress4);
        let wtonBalance = await wtonContract.balanceOf(tonStakeProxyAddress4);
        let tosBalance = await tosContract.balanceOf(tonStakeProxyAddress4);
        console.log("TON balance of StakeTON #4 ", ethers.utils.formatUnits(tonBalance, 18) , " TON") ;
        console.log("WTON balance of StakeTON #4 ", ethers.utils.formatUnits(wtonBalance, 27), " WTON") ;
        console.log("TOS balance of StakeTON #4 ", ethers.utils.formatUnits(tosBalance, 18), " TOS") ;

        let infos = await stakeTON.infos();

        console.log("rewardClaimedTotal ", ethers.utils.formatUnits(infos[3], 18) , " TON" ) ;
        console.log("totalStakedAmount ", ethers.utils.formatUnits(infos[4], 18) , " TON") ;
        console.log("totalStakers ", infos[5]) ;

        const vault1 = await ethers.getContractAt(
            Vault1ABI,
            vault,
            provider
        );
        let rewardTotal = await vault1.totalRewardAmount(tonStakeProxyAddress4);
        console.log("rewardTotal ", ethers.utils.formatUnits(rewardTotal, 18) , " TOS") ;

        console.log("아직 남아 있는 리워드 (withdraw 아직 안함.) ",  ethers.utils.formatUnits(rewardTotal.sub(infos[3]), 18)  , " TOS") ;
    })



    it("StakeTON #3 infos ", async () => {
        const stakeTON = await ethers.getContractAt(
            TokamakStakeUpgrade3Abi,
            tonStakeProxyAddress3,
            provider
        );

        let tonBalance = await tonContract.balanceOf(tonStakeProxyAddress3);
        let wtonBalance = await wtonContract.balanceOf(tonStakeProxyAddress3);
        let tosBalance = await tosContract.balanceOf(tonStakeProxyAddress3);
        console.log("TON balance of StakeTON #3 ", ethers.utils.formatUnits(tonBalance, 18) , " TON") ;
        console.log("WTON balance of StakeTON #3 ", ethers.utils.formatUnits(wtonBalance, 27), " WTON") ;
        console.log("TOS balance of StakeTON #3 ", ethers.utils.formatUnits(tosBalance, 18), " TOS") ;

        let infos = await stakeTON.infos();

        console.log("rewardClaimedTotal ", ethers.utils.formatUnits(infos[3], 18) , " TON" ) ;
        console.log("totalStakedAmount ", ethers.utils.formatUnits(infos[4], 18) , " TON") ;
        console.log("totalStakers ", infos[5]) ;

        const vault1 = await ethers.getContractAt(
            Vault1ABI,
            vault,
            provider
        );
        let rewardTotal = await vault1.totalRewardAmount(tonStakeProxyAddress3);
        console.log("rewardTotal ", ethers.utils.formatUnits(rewardTotal, 18) , " TOS") ;

        console.log("아직 남아 있는 리워드 (withdraw 아직 안함.) ",  ethers.utils.formatUnits(rewardTotal.sub(infos[3]), 18)  , " TOS") ;
    })


    it("StakeTON #2 infos ", async () => {
        const stakeTON = await ethers.getContractAt(
            TokamakStakeUpgrade3Abi,
            tonStakeProxyAddress2,
            provider
        );

        let tonBalance = await tonContract.balanceOf(tonStakeProxyAddress2);
        let wtonBalance = await wtonContract.balanceOf(tonStakeProxyAddress2);
        let tosBalance = await tosContract.balanceOf(tonStakeProxyAddress2);
        console.log("TON balance of StakeTON #2 ", ethers.utils.formatUnits(tonBalance, 18) , " TON") ;
        console.log("WTON balance of StakeTON #2 ", ethers.utils.formatUnits(wtonBalance, 27), " WTON") ;
        console.log("TOS balance of StakeTON #2 ", ethers.utils.formatUnits(tosBalance, 18), " TOS") ;

        let infos = await stakeTON.infos();

        console.log("rewardClaimedTotal ", ethers.utils.formatUnits(infos[3], 18) , " TON" ) ;
        console.log("totalStakedAmount ", ethers.utils.formatUnits(infos[4], 18) , " TON") ;
        console.log("totalStakers ", infos[5]) ;

        const vault1 = await ethers.getContractAt(
            Vault1ABI,
            vault,
            provider
        );
        let rewardTotal = await vault1.totalRewardAmount(tonStakeProxyAddress2);
        console.log("rewardTotal ", ethers.utils.formatUnits(rewardTotal, 18) , " TOS") ;

        console.log("아직 남아 있는 리워드 (withdraw 아직 안함.) ",  ethers.utils.formatUnits(rewardTotal.sub(infos[3]), 18)  , " TOS") ;
    })

    it("StakeTON #1 infos ", async () => {
        const stakeTON = await ethers.getContractAt(
            TokamakStakeUpgrade3Abi,
            tonStakeProxyAddress1,
            provider
        );

        let tonBalance = await tonContract.balanceOf(tonStakeProxyAddress1);
        let wtonBalance = await wtonContract.balanceOf(tonStakeProxyAddress1);
        let tosBalance = await tosContract.balanceOf(tonStakeProxyAddress1);
        console.log("TON balance of StakeTON #1 ", ethers.utils.formatUnits(tonBalance, 18) , " TON") ;
        console.log("WTON balance of StakeTON #1 ", ethers.utils.formatUnits(wtonBalance, 27), " WTON") ;
        console.log("TOS balance of StakeTON #1 ", ethers.utils.formatUnits(tosBalance, 18), " TOS") ;

        let infos = await stakeTON.infos();

        console.log("rewardClaimedTotal ", ethers.utils.formatUnits(infos[3], 18) , " TON" ) ;
        console.log("totalStakedAmount ", ethers.utils.formatUnits(infos[4], 18) , " TON") ;
        console.log("totalStakers ", infos[5]) ;

        const vault1 = await ethers.getContractAt(
            Vault1ABI,
            vault,
            provider
        );
        let rewardTotal = await vault1.totalRewardAmount(tonStakeProxyAddress1);
        console.log("rewardTotal ", ethers.utils.formatUnits(rewardTotal, 18) , " TOS") ;

        console.log("아직 남아 있는 리워드 (withdraw 아직 안함.) ",  ethers.utils.formatUnits(rewardTotal.sub(infos[3]), 18)  , " TOS") ;

        let tester1 ="0x3d827286780dbc00ace4ee416ad8a4c5daac972c"

        let tester1Staked = await stakeTON.userStaked(tester1);
        console.log("tester1Staked ", tester1Staked) ;


    })

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

        console.log('block ', block1.number)
    });

    it("unstaking from layer2", async function () {
        const stakeTON = await ethers.getContractAt(
            ITokamakStakerUpgradeAbi,
            tonStakeProxyAddress1,
            provider
        );

        await (await stakeTON.connect(admin1)["tokamakRequestUnStakingAll(address)"](
            layer2
        )).wait();

    })
    it("      pass blocks", async function () {
        let deplayBlocks = 93046 +20;
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

    it("set percentageBurnTos", async function () {

        let isBurner = await tosContract.hasRole(keccak256("BURNER"), tosAdminAddress);
        console.log("isBurner,tosAdminAddress ", tosAdminAddress, isBurner);
        let isBurner1 = await tosContract.hasRole(keccak256("BURNER"), tonStakeProxyAddress1);
        console.log("isBurner,tonStakeProxyAddress1 ", tonStakeProxyAddress1, isBurner1);

        // await hre.ethers.provider.send("hardhat_impersonateAccount", [
        //     tosAdminAddress,
        // ]);

        // const tosAdmin = await ethers.getSigner(tosAdminAddress);
        // await hre.ethers.provider.send("hardhat_setBalance", [
        //     tosAdminAddress,
        // "0x4EE2D6D415B85ACEF8100000000",
        // ]);
        // await (await tosContract.connect(tosAdmin).addBurner(tonStakeProxyAddress1)).wait();

        //stakingTonRegistry
        const tonRegistry = await ethers.getContractAt(
            RegistryABI,
            registry,
            tonstarterAdmin
        );
        console.log("tonRegistry, ", tonRegistry.address);

        let _name  = "PHASE1.SWAPTOS.BURNPERCENT"
        // console.log("_name", _name);
        // console.log("tonStakeProxyAddress1", tonStakeProxyAddress1);
        // console.log("ethers.constants.zeroAddress",  ethers.constants.zeroAddress );
        // console.log("ethers.BigNumber.from(\"90\")", ethers.BigNumber.from("90"));

        let tx = await tonRegistry.connect(tonstarterAdmin).addDefiInfo(
            _name,
            "0xE75D8392c2EEd2425AFC7fcFba88D340b493ccC2",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            ethers.BigNumber.from("90"),
            "0x0000000000000000000000000000000000000000"
        );

        console.log(tx)

        await tx.wait()

    });

    it("burnPercentage  ", async () => {
        let name = keccak256("PHASE1.SWAPTOS.BURNPERCENT")
        console.log("PHASE1.SWAPTOS.BURNPERCENT, ", name);
        let burnPercentage = await stakingTonRegistry.connect(admin1).defiInfo(name);
        console.log("burnPercentage, ", burnPercentage);

    });


    /** burnPercentage 0 일때,
     tester1Account  0xDABd0Cd9C9573C59f5AA0AEEF551475FF5a39Fa2
tester1Staked  [
  BigNumber { value: "130000000000000000000000" },
  BigNumber { value: "13564201" },
  BigNumber { value: "47725598607356234783003" },
  BigNumber { value: "20258253" },
  BigNumber { value: "161126777909844936330977" },
  BigNumber { value: "136626014316737392793929" },
  true,
  amount: BigNumber { value: "130000000000000000000000" },
  claimedBlock: BigNumber { value: "13564201" },
  claimedAmount: BigNumber { value: "47725598607356234783003" },
  releasedBlock: BigNumber { value: "20258253" },
  releasedAmount: BigNumber { value: "161126777909844936330977" },
  releasedTOSAmount: BigNumber { value: "136626014316737392793929" },
  released: true
]
     */
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
        console.log("tester1Account ", tester1Account.address) ;

        await (await stakeTON.connect(tester1Account)["withdraw()"]()).wait()

        let tester1Staked = await stakeTON.userStaked(tester1);
        console.log("tester1Staked ", tester1Staked) ;

    });

     /*
    it("withdraw test with tonStakeUpgrade6 ", async () => {
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
    */

  });
});
