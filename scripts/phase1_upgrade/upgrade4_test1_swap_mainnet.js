const { ethers } = require("hardhat");

const save = require("../save_deployed");

const Web3EthAbi = require("web3-eth-abi");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");
const wton = loadDeployed(process.env.NETWORK, "WTON");

const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");
const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");

const wtonABI = require("../../abis/TOS.json");
const TokamakStakeUpgrade4ABI = require("../../abis/TokamakStakeUpgrade4.json");

// TON #1 컨트랙 주소 : "0x9a8294566960ab244d78d266ffe0f284cdf728f1"
// TON #2 컨트랙 주소 : "0x7da4E8Ab0bB29a6772b6231b01ea372994c2A49A"

const PHASE1_TON_1_ADDRESS = "0x9a8294566960ab244d78d266ffe0f284cdf728f1";

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const tonContract = await ethers.getContractAt(
    wtonABI.abi,
    ton,
    ethers.provider
  );
  console.log("ton:", ton);

  const tonbalance = await tonContract.balanceOf(PHASE1_TON_1_ADDRESS);
  console.log("tonbalance:", tonbalance.toString());


  const wtonContract = await ethers.getContractAt(
    wtonABI.abi,
    wton,
    ethers.provider
  );
  console.log("wton:", wton);

  const wtonbalance = await wtonContract.balanceOf(PHASE1_TON_1_ADDRESS);
  console.log("wtonbalance:", wtonbalance.toString());

  const StakeTON1 = await ethers.getContractAt(
    TokamakStakeUpgrade4ABI.abi,
    PHASE1_TON_1_ADDRESS,
    ethers.provider
  );
  console.log("StakeTON1:", StakeTON1.address);

  const getPoolAddress = await StakeTON1.getPoolAddress();
  console.log("getPoolAddress:", getPoolAddress);

  const totalStakedAmount = await StakeTON1.totalStakedAmount();
  console.log("totalStakedAmount:", totalStakedAmount.toString());

  // const amount = ethers.BigNumber.from("10000000000000000000000000000000");
  // const tx = await StakeTON1.connect(deployer).callStatic.exchangeWTONtoTOS(
  //   amount
  // );
  // console.log("exchangeWTONtoTOS:", tx);

  // let tx = await StakeTON1.connect(deployer).staticcall.exchangeWTONtoTOS(
  //     wtonbalance.sub(ethers.BigNumber.from("80000000000000000000000000000"))
  //   );
  // console.log("exchangeWTONtoTOS:", tx);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    deployer.address,
    process.env.NETWORK
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // let _func_exchangeWTONtoTOS_old = Web3EthAbi.encodeFunctionSignature("exchangeWTONtoTOS(uint256,uint256,uint256,uint160,uint256)");

  // console.log("_func_exchangeWTONtoTOS_old",_func_exchangeWTONtoTOS_old);

  contracts = await deployMain(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
