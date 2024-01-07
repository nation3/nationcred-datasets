const Passport = require('../abis/Passport.json')
const VotingEscrow = require('../abis/VotingEscrow.json')
const csvWriter = require('csv-writer')
import { ethers } from 'ethers'

const ethersProvider = new ethers.JsonRpcProvider(
  'https://eth.llamarpc.com'
)
console.info('ethersProvider:', ethersProvider)

const passportContract = new ethers.Contract(
  '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333',
  Passport.abi,
  ethersProvider
)

const votingEscrowContract = new ethers.Contract(
  '0xf7def1d2fbda6b74bee7452fdf7894da9201065d',
  VotingEscrow.abi,
  ethersProvider
)

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
      { id: 'voting_power', title: 'voting_power' },
    ],
  })
  let csvRows = []

  const nextId: number = await getNextId()
  console.info('nextId:', nextId)

  let passportId: number
  for (passportId = 0; passportId < nextId; passportId++) {
    console.info('passportId:', passportId)

    let ownerAddress: string = await getOwner(passportId)
    console.info('ownerAddress:', ownerAddress)

    ownerAddress = ownerAddress.toLowerCase()
    console.info('lowercase ownerAddress:', ownerAddress)

    let signerAddress: string = await getSigner(passportId)
    console.info('signerAddress:', signerAddress)

    signerAddress = signerAddress.toLowerCase()
    console.info('lowercase signerAddress:', signerAddress)

    const ensName: string | null = await getEnsName(ownerAddress)
    console.info('ensName:', ensName)

    const votingPowerWei: number = await getVotingPower(ownerAddress)
    console.info('votingPowerWei:', votingPowerWei)
    const votingPowerEther: string = ethers.formatUnits(votingPowerWei)
    console.info('votingPowerEther:', votingPowerEther)
    const votingPowerRounded: string = new Number(votingPowerEther).toFixed(2)
    console.info('votingPowerRounded:', votingPowerRounded)

    // Export to CSV
    const csvRow = {
      passport_id: passportId,
      owner_address: ownerAddress.toLowerCase(),
      signer_address: signerAddress.toLowerCase(),
      ens_name: ensName,
      voting_power: votingPowerRounded
    }
    csvRows.push(csvRow)
  }

  writer.writeRecords(csvRows)
}

async function getNextId(): Promise<number> {
  console.info('getNextId')
  return await passportContract.getNextId()
}

async function getOwner(passportId: number): Promise<string> {
  console.info('getOwner')
  try {
    return await passportContract.ownerOf(passportId)
  } catch (err) {
    console.error('err:', err)
    return ethers.ZeroAddress
  }
}

async function getSigner(passportId: number): Promise<string> {
  console.info('getSigner')
  try {
    return await passportContract.signerOf(passportId)
  } catch (err) {
    console.error('err:', err)
    return ethers.ZeroAddress
  }
}

async function getEnsName(ethAddress: string): Promise<string | null> {
  console.info('getEnsName')
  return await ethersProvider.lookupAddress(ethAddress)
}

async function getVotingPower(ethAddress: string): Promise<number> {
  console.info('getVotingPower')
  return await votingEscrowContract.balanceOf(ethAddress)
}

export {}
