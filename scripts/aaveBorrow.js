const { getWeth } = require("./getWeth")
const { getNamedAccounts, ethers } = require("hardhat")
const { lendingPoolProviderAbi, lendingPoolAbi } = require("../abi/abi")
const { wethTokenAddress, AMOUNT } = require("../helper-hardhat-config")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()

    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool Address : ${lendingPool.address}`)

    // deposit (First we need to approve weth token address)
    await approveERC20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)

    console.log("Depositing....")
    // depositing collateral to protocol
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited")
}

async function getLendingPool(account) {
    const lendingPoolProvider = await ethers.getContractAt(
        lendingPoolProviderAbi,
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )

    const lendingPoolAddress = await lendingPoolProvider.getLendingPool()

    const lendingPool = await ethers.getContractAt(
        lendingPoolAbi,
        lendingPoolAddress,
        account
    )

    return lendingPool
}

async function approveERC20(
    erc20Address,
    spenderAddress,
    amountToSpent,
    account
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        erc20Address,
        account
    )

    const tx = await erc20Token.approve(spenderAddress, amountToSpent)
    await tx.wait(1)
    console.log("Approved......")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
