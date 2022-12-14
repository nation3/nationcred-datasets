const Web3 = require('web3')
const Passport = require('./abis/Passport.json')
const VotingEscrow = require('./abis/VotingEscrow.json')
const csvWriter = require('csv-writer')
const fs = require('fs')
const ethers = require('ethers')

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const ethersProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth')
console.info('ethersProvider:', ethersProvider)

const PassportContract = new web3.eth.Contract(Passport.abi, '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333')
console.info('PassportContract._address:', PassportContract._address)

const VotingEscrowContract = new web3.eth.Contract(VotingEscrow.abi, '0xf7def1d2fbda6b74bee7452fdf7894da9201065d')
console.info('VotingEscrowContract._address:', VotingEscrowContract._address)

loadCitizenData()

/**
 * Iterates the NFT passports, and exports their ID and Ethereum address to a CSV file.
 */
async function loadCitizenData() {
  console.info('loadCitizenData')

  const writer = csvWriter.createObjectCsvWriter({
    path: 'output/citizens.csv',
    header: [
      { id: 'passport_id', title: 'passport_id' },
      { id: 'owner_address', title: 'owner_address' },
      { id: 'signer_address', title: 'signer_address' },
      { id: 'ens_name', title: 'ens_name' },
      { id: 'voting_power', title: 'voting_power' }
    ]
  })
  let csvRows = []

  const nextId: number = await getNextId()
  console.info('nextId:', nextId)
  
  let passportId: number
  for (passportId = 0; passportId < nextId; passportId++) {
    console.info('passportId:', passportId)

    const ownerAddress: string = await getOwner(passportId)
    console.info('ownerAddress:', ownerAddress)

    const signerAddress: string = await getSigner(passportId)
    console.info('signerAddress:', signerAddress)

    const ensName: string = await getEnsName(ownerAddress)
    console.info('ensName:', ensName)

    const votingPowerWei: number = await getVotingPower(ownerAddress)
    console.info('votingPowerWei:', votingPowerWei)
    const votingPowerEther: string = web3.utils.fromWei(votingPowerWei)
    console.info('votingPowerEther:', votingPowerEther)
    const votingPowerRounded: string = new Number(votingPowerEther).toFixed(2)
    console.info('votingPowerRounded:', votingPowerRounded)

    // Export to CSV
    const csvRow = {
      passport_id: passportId,
      owner_address: ownerAddress,
      signer_address: signerAddress,
      ens_name: ensName,
      voting_power: votingPowerRounded
    }
    csvRows.push(csvRow)
  }

  writer.writeRecords(csvRows)
}

async function getNextId(): Promise<number> {
  console.info('getNextId')
  return await PassportContract.methods.getNextId().call()
}

async function getOwner(passportId: number): Promise<string> {
  console.info('getOwner')
  return await PassportContract.methods.ownerOf(passportId).call()
}

async function getSigner(passportId: number): Promise<string> {
  console.info('getSigner')
  return await PassportContract.methods.signerOf(passportId).call()
}

async function getEnsName(ethAddress: string): Promise<string> {
  console.info('getEnsName')
  return await ethersProvider.lookupAddress(ethAddress)
}

async function getVotingPower(ethAddress: string): Promise<number> {
  console.info('getVotingPower')
  return await VotingEscrowContract.methods.balanceOf(ethAddress).call()
}
