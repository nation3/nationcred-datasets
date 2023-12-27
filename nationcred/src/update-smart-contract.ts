require('dotenv').config()
const NationCred = require('../abis/NationCred.json')
const fs = require('fs')
const Papa = require('papaparse')
import { BigNumber, ethers } from "ethers"

/**
 * Fetches last week's active citizens from `nationcred-active-citizens.csv`
 * 
 * @returns A Promise with a number array, where each number represents a passport ID
 */
const lookupActiveCitizensFromCSV = async (): Promise<number[]> => {
  console.log('lookupActiveCitizensFromCSV')

  const filePath = "output/nationcred-active-citizens.csv"
  const file: File = fs.readFileSync(filePath)
  const csvData = file.toString()
  console.info('csvData:\n', csvData)

  const promise: Promise<number[]> = new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data
        console.log('data.length:', data.length)
        
        const lastWeekEnd = data[data.length - 1]
        console.log('lastWeekEnd:', lastWeekEnd)

        // Convert from string ("1,2,3") to array of numbers ([ 1, 2, 3 ])
        const activeCitizensAsString: string = lastWeekEnd['active_citizens']
        console.log('activeCitizensAsString:', activeCitizensAsString)
        const activeCitizensAsNumberArray: number[] = activeCitizensAsString.split(',').map(Number)
        console.log('activeCitizensAsNumberArray:', activeCitizensAsNumberArray)
        
        resolve(activeCitizensAsNumberArray)
      }
    })
  })
  return promise
}

(async () => {
  const passportIDs = await lookupActiveCitizensFromCSV()
  console.log('passportIDs:', passportIDs)

  const privateKey = process.env.CONTRACT_OWNER_PRIVATE_KEY
  if (privateKey == undefined) {
    console.error('Error: CONTRACT_OWNER_PRIVATE_KEY not found')
    return
  }

  const wallet = new ethers.Wallet(privateKey)
  console.log('wallet.address:', wallet.address)

  const provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com')
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

  const nationCredContract = new ethers.Contract("0x7794F0Eb1eA812fBcdaBD559551Fb26A79720925", NationCred.abi, signer)
  console.log('nationCredContract.address:', nationCredContract.address)
  console.log('nationCredContract.owner():', await nationCredContract.owner())
  
  const receipt = await nationCredContract.setActiveCitizens(passportIDs)
  console.log('receipt', receipt)
})()
