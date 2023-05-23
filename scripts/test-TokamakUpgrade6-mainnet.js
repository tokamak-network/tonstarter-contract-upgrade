const { ethers } = require("hardhat");

require("dotenv").config();


const tonStakeProxyAddress = "0x9a8294566960Ab244d78D266FFe0f284cDf728F1";
const registry = "0x4Fa71D6964a97c043CA3103407e1B3CD6b5Ab367";
const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

const poolAddress = "0x1c0cE9aAA0c12f53Df3B4d8d77B82D6Ad343b4E4";
const tosAddress = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153";
const tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5";
const wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2";

const tosABI = require("../abis/TOS.json").abi;
const TokamakStakeUpgrade6Abi = require("../artifacts/contracts/connection/TokamakStakeUpgrade6.sol/TokamakStakeUpgrade6.json").abi;
const QuoterABI = require("../abis/Quoter.json").abi;
const UniswapV3PoolAbi = require("../abis/UniswapV3Pool.json").abi;

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


async function testSwap() {
  const [deployer, user1] = await ethers.getSigners();
  provider = ethers.provider;

  tosContract = await ethers.getContractAt(tosABI, tosAddress, provider);
  console.log("tosContract, ", tosContract.address);
  tonContract = await ethers.getContractAt(tosABI, tonAddress, provider);
  console.log("tonContract, ", tonContract.address);

  wtonContract = await ethers.getContractAt(tosABI, wtonAddress, provider);
  console.log("wtonContract, ", wtonContract.address);

  const _balance = await wtonContract.balanceOf(tonStakeProxyAddress);
  console.log("_balance, ", tonStakeProxyAddress, ethers.utils.formatUnits(_balance, 27), "WTON");

  //
  tonStakeUpgrade6 = await ethers.getContractAt(
    TokamakStakeUpgrade6Abi,
    tonStakeProxyAddress,
    provider
  );
  console.log("tonStakeUpgrade6, ", tonStakeUpgrade6.address);

  let changeTick = 0;

  /* 메인넷 배포후, 아래 실행가능함.
  //-- check the swapable environment
  let UniswapV3Pool =  await ethers.getContractAt(UniswapV3PoolAbi, poolAddress, provider);
  let slot0 = await UniswapV3Pool.slot0();

  let averageTick = await tonStakeUpgrade6.consult(poolAddress, 120);
  let acceptTickIntervalInOracle = await tonStakeUpgrade6.acceptTickIntervalInOracle();
  let acceptMaxTick = await tonStakeUpgrade6.acceptMaxTick(averageTick, 60, acceptTickIntervalInOracle)
  changeTick = await tonStakeUpgrade6.changeTick();
  if (changeTick == 0) changeTick = 18;
  if(slot0.tick > acceptMaxTick) {
    console.log('The current price is greater than the average price over the last 2 minutes. Swap is not supported in this environment.')

    return ;
  }
  */
  if (changeTick == 0) changeTick = 18;

  // calculate swapable amount
   // 현재 보유하고 있는 wton 의 잔액 (톤을 포함)
   let balanceWTON = await wtonContract.balanceOf(tonStakeProxyAddress);
   console.log('balanceWTON', ethers.utils.formatUnits(balanceWTON, 27), "WTON")

   let balanceTON = await tonContract.balanceOf(tonStakeProxyAddress);
   console.log('balanceTON', ethers.utils.formatUnits(balanceTON, 18), "TON")

   // 스왑하려는 wton 양을 찿는다.
   let totalBalance = balanceWTON.add(balanceTON.mul(ethers.BigNumber.from("1000000000")))
   let amount = totalBalance;
   console.log("the amount of WTON to swap ", ethers.utils.formatUnits(amount, 27) ,"WTON");

   ///---
   const quoter = await ethers.getContractAt(QuoterABI, quoterAddress, provider);
   let _quoteExactInput = await quoter.connect(deployer).callStatic.quoteExactInput(
     encodePath([wtonAddress,tosAddress], [3000]), amount);
   console.log("The amount of TOS swapped when you actually swap in Uniswap : _quoteExactInput  ",
     ethers.utils.formatUnits(_quoteExactInput, 18) , 'TOS'
   //_quoteExactInput.toString()
   );

   ///--
   const limitPrameters = await tonStakeUpgrade6.limitPrameters(amount, poolAddress, wtonAddress, tosAddress,  changeTick);
   console.log("Minimum swap amount allowed : limitPrameters", ethers.utils.formatUnits(limitPrameters[0], 18), 'TOS' );

   let _quoteExactInput1 = await quoter.connect(deployer).callStatic.quoteExactInputSingle(
     wtonAddress,
     tosAddress,
     3000,
     amount,
     limitPrameters[2]);

  console.log("_quoteExactInput1  ", ethers.utils.formatUnits(_quoteExactInput1, 18) , 'TOS');


  if (limitPrameters[0].gt(_quoteExactInput)) { // re-calculate amount what want to swap

    let _quoteExactOut = await quoter.connect(deployer).callStatic.quoteExactOutput(
      encodePath([tosAddress, wtonAddress], [3000]),
      _quoteExactInput1.mul(ethers.BigNumber.from("10005")).div(ethers.BigNumber.from("10000"))
      );

      console.log("re-calculate the input amount of WTON to swap ", ethers.utils.formatUnits(_quoteExactOut, 27), "WTON");
      amount = _quoteExactOut;
  }

  // swap
  // const tx = await tonStakeUpgrade6.connect(deployer).exchangeWTONtoTOS(amount);
  // console.log("exchangeWTONtoTOS tx: ", tx.hash);

  // await tx.wait();

  // const _balanceAfterSwap = await wtonContract.connect(deployer).balanceOf(tonStakeProxyAddress);
  // console.log("wtonContract _balanceAfterSwap, ", tonStakeProxyAddress, ethers.utils.formatUnits(_balanceAfterSwap, 27) );

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address,
    process.env.NETWORK
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await testSwap(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
