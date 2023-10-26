//require("@nomicfoundation/hardhat-toolbox");

//require('solidity-coverage')
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

require("dotenv/config");
require("dotenv").config();

//https://eth-mainnet.g.alchemy.com/v2/4YQ2qN3WAMM0goUFbRpWfaXjL5_BwU-o
//https://eth-mainnet.alchemyapi.io/v2/${process.env.alchemyKey}


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        blockNumber: 18431020
      },
      allowUnlimitedContractSize: true,
      timeout: 120000
    },
    local: {
      // chainId: 31337,
      url: `http://127.0.0.1:8545/`,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`${process.env.ACCOUNT0_PK}`,`${process.env.ACCOUNT1_PK}`,`${process.env.ACCOUNT1_PK}`],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`${process.env.ACCOUNT0_PK}`],
      gasMultiplier: 1.25,
      gasPrice: 25000000000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 21,
    coinmarketcap: `${process.env.COINMARKETCAP_API_KEY}`
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

};
