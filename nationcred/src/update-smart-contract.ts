require('dotenv').config()
const NationCred = require('../abis/NationCred.json')
import { BigNumber, ethers } from "ethers"

(async () => {
  const privateKey = process.env.CONTRACT_OWNER_PRIVATE_KEY
  if (privateKey == undefined) {
    console.error('Error: CONTRACT_OWNER_PRIVATE_KEY not found')
    return
  }

  const wallet = new ethers.Wallet(privateKey)
  console.log('wallet.address:', wallet.address)

  // const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth')
  const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia')
  console.log('provider.getNetwork().name:', (await provider.getNetwork()).name)

  const feeData = await provider.getFeeData()
  const gasPriceInGwei = ethers.utils.formatUnits(BigNumber.from(feeData.gasPrice), "gwei")
  console.log('gasPriceInGwei:', `${gasPriceInGwei} gwei`)
  const maxFeePerGasInGwei = ethers.utils.formatUnits(BigNumber.from(feeData.maxFeePerGas), "gwei")
  console.log('maxFeePerGasInGwei:', `${maxFeePerGasInGwei} gwei`)

  const signer = wallet.connect(provider)
  console.log('signer.getChainId():', await signer.getChainId())
  console.log('signer.getAddress():', await signer.getAddress())
  console.log('signer.getBalance():', `${ethers.utils.formatUnits(await signer.getBalance())} ether`)

  // const nationCredContract = new ethers.Contract("0x6e6fcee39185b900821c2f67671ba8c28e342cda", NationCred.abi, signer)
  const nationCredContract = new ethers.Contract("0xdc5dE9960aAf60CE8C773f88E7F3cC9E8dD62130", NationCred.abi, signer)
  console.log('nationCredContract.address:', nationCredContract.address)
  console.log('nationCredContract.owner():', await nationCredContract.owner())

  const passportIDs = [1,2,3]
  const receipt = await nationCredContract.setActiveCitizens(passportIDs)
  console.log('receipt', receipt)
})()
