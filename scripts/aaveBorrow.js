const { getWeth } = require("./getWeth")
const { getNamedAccounts, ethers } = require("hardhat")
const { lendingPoolProviderAbi, lendingPoolAbi } = require("../abi/abi")
const {
    wethTokenAddress,
    AMOUNT,
    daiEthPriceFeedAddress,
    daiTokenAddress,
} = require("../helper-hardhat-config")

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

    // getting user account data
    let { availableBorrowsETH, totalCollateralETH } =
        await getBorrowUserAccountData(lendingPool, deployer)

    const daiPrice = await getDAIPrice()
    const amountDaiToBorrow =
        availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toString())
    console.log(amountDaiToBorrow)

    const amountDaiToBorrowInWei = ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    )
    console.log(amountDaiToBorrowInWei.toString())

    // Borrowing DAI
    await borrowDAI(
        daiTokenAddress,
        amountDaiToBorrowInWei,
        lendingPool,
        deployer
    )

    await getBorrowUserAccountData(lendingPool, deployer)

    // repay
    await repayDebt(
        amountDaiToBorrowInWei,
        daiTokenAddress,
        lendingPool,
        deployer
    )

    await getBorrowUserAccountData(lendingPool, deployer)
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

async function getBorrowUserAccountData(lendingPool, userAddress) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(userAddress)

    console.log(`Total Collateral ETH Deposited: ${totalCollateralETH}`)
    console.log(`Total borrowed ETH: ${totalDebtETH} `)
    console.log(`Available ETH to Borrow: ${availableBorrowsETH}`)

    return { availableBorrowsETH, totalDebtETH }
}

// for getting current dai price in eth
async function getDAIPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        daiEthPriceFeedAddress
    )

    const { answer } = await daiEthPriceFeed.latestRoundData() // in wei unit
    console.log(`DAI / ETH Price : ${ethers.utils.formatEther(answer)}`)

    return answer
}

async function borrowDAI(
    daiAddress,
    amountDaiToBorrowInWei,
    lendingPool,
    account
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowInWei,
        1 /* 1 - stable mode*/,
        0 /* after new update it is always 0*/,
        account
    )

    await borrowTx.wait(1)
    console.log("You borrowed DAI.")
}

async function repayDebt(amount, daiAddress, lendingPool, account) {
    await approveERC20(daiAddress, lendingPool.address, amount, account) // we need to approve dai before sending it back to pool
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaied....")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
