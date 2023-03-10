const { ethers } = require("hardhat")

const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

const AMOUNT = ethers.utils.parseEther("0.02")

const daiEthPriceFeedAddress = "0x773616E4d11A78F511299002da57A0a94577F1f4"
const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

module.exports = {
    wethTokenAddress,
    AMOUNT,
    daiEthPriceFeedAddress,
    daiTokenAddress,
}
