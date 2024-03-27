const chai = require("chai");
const Web3EthAbi = require("web3-eth-abi");
require("chai").should();
const { expect } = require("chai");
const {
  keccak256,
} = require("web3-utils");
const hre = require("hardhat");
const { ethers } = require("hardhat");
const { Signer, Contract, ContractFactory } = require("ethers")
const LockTOSAbi = require("./abi/LockTOS.json")
const LockTOSProxyAbi = require("./abi/LockTOSProxy.json")
const TOSAbi = require("./abi/TOS.json")

let accounts, admin1,  user1, user2, user3, user4, provider;
let lockTOSLogic, lockTOSProxy, lockTOS, tosContract
let epochUnit,  maxTime;

let tosAddress = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153"
let tosAdminAddress = "0x12A936026F072d4e97047696A9d11F97Eae47d21"
let tosAdmin

let lockIds = []
// {account: , lockId: , value: , unlockTime }
// locakTOS 를 새로 포팅하고, 초기화 정보를 설정하고,
// 52 주 * 6년 = 312 주
// epochUnit 을 1시간으로 할 경우, 312 시간 : 13 일 정도의 시뮬레이션
// 테스트 아이디 10개..
// 매 10분 마다 deposit 하고, 20분, 40분마다 조회하고, 3년 뒤에 withdraw
// 13일 지났을때, 다시 조회가 되는지 확인한다.

// 새로 배포하자.
// 1. LockTOSProxy , LockTOS
//

function decimalToHexString(number)
{
    if (number < 0)  number = 0xFFFFFFFF + number + 1;
    return number.toString(16).toUpperCase();
}

async function deployContract(
  abi,
  bytecode,
  deployParams,
  actor )
{
  const factory = new ContractFactory(abi, bytecode, actor);
  return await factory.deploy(...deployParams);
}

async function allowance(
  contract,
  from,
  to,
  amount )
{
  const allowanceAmount = await contract.allowance(from.address, to.address);

  if(allowanceAmount.lt(amount)) {
    await (await contract.connect(from).approve(to.address, amount)).wait()
  }
}


describe("LockTOS Test", function () {

  before(async () => {
    accounts = await ethers.getSigners();
    // console.log(accounts)
    [admin1, user1, user2, user3, user4] = accounts;
    provider = ethers.provider;
    await provider.get
    epochUnit = 3600 // 1시간  //604800
    maxTime = 561600 //  3600*52*3  156 시간 // 94348800  94348800
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
      tosContract = await ethers.getContractAt(TOSAbi.abi, tosAddress, admin1);
      console.log('tosContract', tosContract.address)
    });

    it("lockTOS, lockTOSProxy ", async () => {
        lockTOSLogic = await deployContract(LockTOSAbi.abi, LockTOSAbi.bytecode, [], admin1);

        lockTOSProxy = await deployContract(
          LockTOSProxyAbi.abi,
          LockTOSProxyAbi.bytecode,
          [lockTOSLogic.address, admin1.address],
          admin1
        );
        console.log('lockTOSProxy', lockTOSProxy.address)
    });

    it("initialize ", async () => {
      await (await lockTOSProxy.connect(admin1).initialize(tosAddress, epochUnit, maxTime )).wait()
    });

  })

  describe(" TOS mint ", () => {

    it("addMinter ", async () => {
      await (await tosContract.connect(tosAdmin).addMinter(admin1.address)).wait();
    });

    it("mint ", async () => {
      let amount = ethers.utils.parseEther("10000")
      await (await tosContract.connect(admin1).mint(user1.address, amount)).wait();
      await (await tosContract.connect(admin1).mint(user2.address, amount)).wait();
      await (await tosContract.connect(admin1).mint(user3.address, amount)).wait();
      await (await tosContract.connect(admin1).mint(user4.address, amount)).wait();

    });

  })

  describe(" deposit lockTOS ", () => {

    it("lockTOS ", async () => {
      lockTOS = await ethers.getContractAt(LockTOSAbi.abi, lockTOSProxy.address, admin1);
    });

    it("createLock : 1", async () => {
      const amount = ethers.utils.parseEther("100")

      const maxTime_ = await lockTOS.maxTime()
      const epochUnit_ = await lockTOS.epochUnit()
      const unlockWeeks = maxTime_.div(epochUnit_)

      await allowance(tosContract, user1, lockTOS, amount)
      const receipt = await (await lockTOS.connect(user1).createLock(amount, unlockWeeks)).wait()


      const topic = lockTOS.interface.getEventTopic('LockCreated');
      const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
      const deployedEvent = lockTOS.interface.parseLog(log);

      lockIds.push(
        {
          account: deployedEvent.args.account,
          lockId: deployedEvent.args.lockId,
          value: deployedEvent.args.value,
          unlockTime: deployedEvent.args.value
        }
      )
    });

    it("createLock : 2 ", async () => {
      const amount = ethers.utils.parseEther("100")

      const maxTime_ = await lockTOS.maxTime()
      const epochUnit_ = await lockTOS.epochUnit()
      const unlockWeeks = maxTime_.div(epochUnit_)

      await allowance(tosContract, user2, lockTOS, amount)
      const receipt = await (await lockTOS.connect(user2).createLock(amount, unlockWeeks)).wait()


      const topic = lockTOS.interface.getEventTopic('LockCreated');
      const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
      const deployedEvent = lockTOS.interface.parseLog(log);

      lockIds.push(
        {
          account: deployedEvent.args.account,
          lockId: deployedEvent.args.lockId,
          value: deployedEvent.args.value,
          unlockTime: deployedEvent.args.value
        }
      )
    });

    it("createLock : 3 ", async () => {
      const amount = ethers.utils.parseEther("100")

      const maxTime_ = await lockTOS.maxTime()
      const epochUnit_ = await lockTOS.epochUnit()
      const unlockWeeks = maxTime_.div(epochUnit_)

      await allowance(tosContract, user3, lockTOS, amount)
      const receipt = await (await lockTOS.connect(user3).createLock(amount, unlockWeeks)).wait()


      const topic = lockTOS.interface.getEventTopic('LockCreated');
      const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
      const deployedEvent = lockTOS.interface.parseLog(log);

      lockIds.push(
        {
          account: deployedEvent.args.account,
          lockId: deployedEvent.args.lockId,
          value: deployedEvent.args.value,
          unlockTime: deployedEvent.args.value
        }
      )
    });

    it("createLock : 4 ", async () => {
      const amount = ethers.utils.parseEther("100")

      const maxTime_ = await lockTOS.maxTime()
      const epochUnit_ = await lockTOS.epochUnit()
      const unlockWeeks = maxTime_.div(epochUnit_)
      console.log('maxTime_', maxTime_)
      console.log('epochUnit_', epochUnit_)

      await allowance(tosContract, user4, lockTOS, amount)
      const receipt = await (await lockTOS.connect(user4).createLock(amount, unlockWeeks)).wait()


      const topic = lockTOS.interface.getEventTopic('LockCreated');
      const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
      const deployedEvent = lockTOS.interface.parseLog(log);

      lockIds.push(
        {
          account: deployedEvent.args.account,
          lockId: deployedEvent.args.lockId,
          value: deployedEvent.args.value,
          unlockTime: deployedEvent.args.value
        }
      )
    });

    it("      pass time : 1 day ", async function () {
        let block = await ethers.provider.getBlock('latest')

        let periodTime = 60*60*24
        let blockLen = periodTime / 12
        let hexLen = "0x"+decimalToHexString(blockLen);

        await ethers.provider.send("evm_increaseTime", [periodTime])
        await hre.network.provider.send("hardhat_mine", [hexLen]);
        let block1 = await ethers.provider.getBlock('latest')

        // console.log('passed time ', block1.timestamp - block.timestamp)
        // console.log('passed blocks ', block1.number - block.number)

    })

    it("depositFor : 1", async () => {

      let curLockId = lockIds[0]
      let curAccount = user1;
      console.log(curLockId)
      // console.log(curAccount)

      if (user1.address == curLockId.account)  curAccount = user1;
      else if (user2.address == curLockId.account)  curAccount = user2;
      else if (user3.address == curLockId.account)  curAccount = user3;
      else if (user4.address == curLockId.account)  curAccount = user4;
      console.log(curAccount.address)


      let info = await lockTOS.locksInfo(curLockId.lockId)
      console.log(info)

      let block1 = await ethers.provider.getBlock('latest')
      console.log(block1)

      const amount = ethers.utils.parseEther("1")

      // const maxTime_ = await lockTOS.maxTime()
      // const epochUnit_ = await lockTOS.epochUnit()
      // const unlockWeeks = maxTime_.div(epochUnit_)

      await allowance(tosContract, curAccount, lockTOS, amount)

      const receipt = await (await lockTOS.connect(curAccount).depositFor(
        curLockId.account,
        curLockId.lockId,
        amount)
      ).wait()
      console.log(receipt)

      const topic = lockTOS.interface.getEventTopic('LockDeposited');
      const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
      const deployedEvent = lockTOS.interface.parseLog(log);
      console.log(deployedEvent.args)

      lockIds[0].value =  curLockId.value.add(deployedEvent.args.value)

    });

    // it("createLock : 1", async () => {
    //   const amount = ethers.utils.parseEther("10")

    //   const maxTime_ = await lockTOS.maxTime()
    //   const epochUnit_ = await lockTOS.epochUnit()
    //   const unlockWeeks = maxTime_.div(epochUnit_)

    //   await allowance(tosContract, user1, lockTOS, amount)
    //   const receipt = await (await lockTOS.connect(user1).createLock(amount, unlockWeeks)).wait()


    //   const topic = lockTOS.interface.getEventTopic('LockCreated');
    //   const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
    //   const deployedEvent = lockTOS.interface.parseLog(log);

    //   lockIds.push(
    //     {
    //       account: deployedEvent.args.account,
    //       lockId: deployedEvent.args.lockId,
    //       value: deployedEvent.args.value,
    //       unlockTime: deployedEvent.args.value
    //     }
    //   )
    // });

    // it("      pass time : 1 day ", async function () {
    //   let block = await ethers.provider.getBlock('latest')

    //   let periodTime = 60*60*24
    //   let blockLen = periodTime / 12
    //   let hexLen = "0x"+decimalToHexString(blockLen);

    //   await ethers.provider.send("evm_increaseTime", [periodTime])
    //   await hre.network.provider.send("hardhat_mine", [hexLen]);
    //   let block1 = await ethers.provider.getBlock('latest')

    //   // console.log('passed time ', block1.timestamp - block.timestamp)
    //   // console.log('passed blocks ', block1.number - block.number)

    // })

    // it("createLock : 2", async () => {
    //   const amount = ethers.utils.parseEther("10")

    //   const maxTime_ = await lockTOS.maxTime()
    //   const epochUnit_ = await lockTOS.epochUnit()
    //   const unlockWeeks = maxTime_.div(epochUnit_)

    //   await allowance(tosContract, user2, lockTOS, amount)
    //   const receipt = await (await lockTOS.connect(user2).createLock(amount, unlockWeeks)).wait()

    //   const topic = lockTOS.interface.getEventTopic('LockCreated');
    //   const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
    //   const deployedEvent = lockTOS.interface.parseLog(log);

    //   lockIds.push(
    //     {
    //       account: deployedEvent.args.account,
    //       lockId: deployedEvent.args.lockId,
    //       value: deployedEvent.args.value,
    //       unlockTime: deployedEvent.args.value
    //     }
    //   )
    // });

    // it("      pass time : 1 day ", async function () {
    //   let block = await ethers.provider.getBlock('latest')

    //   let periodTime = 60*60*24
    //   let blockLen = periodTime / 12
    //   let hexLen = "0x"+decimalToHexString(blockLen);

    //   await ethers.provider.send("evm_increaseTime", [periodTime])
    //   await hre.network.provider.send("hardhat_mine", [hexLen]);
    //   let block1 = await ethers.provider.getBlock('latest')

    //   // console.log('passed time ', block1.timestamp - block.timestamp)
    //   // console.log('passed blocks ', block1.number - block.number)

    // })



  });

})
