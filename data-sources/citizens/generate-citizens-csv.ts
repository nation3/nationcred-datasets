const Web3 = require('web3')
const Passport = require('./abis/Passport.json')
const csvWriter = require('csv-writer')
const fs = require('fs')
const ethers = require('ethers')
import { AvatarResolver, utils } from '@ensdomains/ens-avatar'

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const ethersProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth')
console.info('ethersProvider:', ethersProvider)

const PassportContract = new web3.eth.Contract(Passport.abi, '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333')
console.info('PassportContract._address:', PassportContract._address)

const avatarResolver = new AvatarResolver(ethersProvider)

loadCitizenData()

/**
 * Iterates the NFT passports, and exports their ID and Ethereum address to a CSV file.
 */
async function loadCitizenData() {
  console.info('loadCitizenData')

  const writer = csvWriter.createObjectCsvWriter({
    path: 'citizens.csv',
    header: [
      { id: 'passport_id', title: 'passport_id' },
      { id: 'eth_address', title: 'eth_address' },
      { id: 'ens_name', title: 'ens_name' },
      { id: 'ens_avatar_uri', title: 'ens_avatar_uri' }
    ]
  })
  let csvRows = []

  const nextId: number = await getNextId()
  console.info('nextId:', nextId)
  
  let passportId: number
  for (passportId = 0; passportId < nextId; passportId++) {
    console.info('passportId:', passportId)

    const signerAddress: string = await getSigner(passportId)
    console.info('signerAddress:', signerAddress)

    const ensName: string = await getEnsName(signerAddress)
    console.info('ensName:', ensName)

    let ensAvatarUri
    if (ensName) {
      try {
        ensAvatarUri = await getEnsAvatarUri(ensName)
        console.log('ensAvatarUri:', ensAvatarUri)
      } catch (err) {
        console.error('err:', err)
      }
    }

    // Export to CSV
    const csvRow = {
      passport_id: passportId,
      eth_address: signerAddress,
      ens_name: ensName,
      ens_avatar_uri: ensAvatarUri
    }
    csvRows.push(csvRow)
  }

  writer.writeRecords(csvRows)
}

async function getNextId(): Promise<number> {
  console.info('getNextId')
  return await PassportContract.methods.getNextId().call()
}

async function getSigner(passportId: number): Promise<string> {
  console.info('getSigner')
  return await PassportContract.methods.signerOf(passportId).call()
}

async function getEnsName(ethAddress: string): Promise<string> {
  console.info('getEnsName')
  return await ethersProvider.lookupAddress(ethAddress)
}

async function getEnsAvatarUri(ensName: string): Promise<string | null> {
  console.info('getEnsAvatarUri')
  const avatarMetadata = await avatarResolver.getMetadata(ensName)
  console.info('avatarMetadata:', avatarMetadata)
  if (!avatarMetadata) {
    return null
  }
  const avatarUri = utils.getImageURI({ metadata: avatarMetadata })
  console.info('avatarUri:', avatarUri)
  return avatarUri
}
