const { getNamedAccounts, ethers } = require("hardhat")
const { wethTokenAddress, AMOUNT } = require("../helper-hardhat-config")

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    const iWeth = await ethers.getContractAt(
        "IWeth",
        wethTokenAddress,
        deployer
    )

    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)

    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`)
}

module.exports = {
    getWeth,
}
