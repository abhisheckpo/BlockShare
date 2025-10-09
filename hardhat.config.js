require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // your Hardhat local node
    },
  },
  paths: {
    artifacts: "./client/src/artifacts", // where compiled files go for React
  },
};
