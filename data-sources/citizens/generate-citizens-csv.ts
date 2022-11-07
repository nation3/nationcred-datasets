const Web3 = require('web3')
const Passport = require('./abis/Passport.json')
const csvWriter = require('csv-writer')
const fs = require('fs')

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const PassportContract = new web3.eth.Contract(Passport.abi, '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333')
console.info('PassportContract._address:', PassportContract._address)

loadCitizenData()

/**
 * Iterates the NFT passports, and exports their ID and Ethereum address to a CSV file.
 */
async function loadCitizenData() {
  console.info('loadCitizenData')

  // TODO
}
