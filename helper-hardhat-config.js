const { ethers } = require("hardhat")

const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

const AMOUNT = ethers.utils.parseEther("0.02")

module.exports = {
    wethTokenAddress,
    AMOUNT,
}
