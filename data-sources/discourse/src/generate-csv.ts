const csvWriter = require('csv-writer')
import { ethers } from 'ethers'
const Discourse = require('../abis/Discourse.json')

const ethersProvider = new ethers.JsonRpcProvider(
  'https://eth.llamarpc.com'
)
console.info('ethersProvider:', ethersProvider)

const discourseContract = new ethers.Contract(
  '0xC396F3536Cc67913bbE1e5E454c10BBA4ae8928F',
  Discourse.abi,
  ethersProvider
)

generateData()

/**
 * Fetches data from citizens.csv and looks up the Discourse usernames.
 */
async function generateData() {
  console.info('generateData')

  const outputFilePath = 'output/discourse-usernames.csv'
  console.info('outputFilePath:', outputFilePath)

  const writer = csvWriter.createObjectCsvWriter({
    path: outputFilePath,
    header: [
      { id: 'passport_id', title: 'passport_id' },
      { id: 'owner_address', title: 'owner_address' },
      { id: 'discourse_username', title: 'discourse_username' }
    ]
  })
  const csvRows: any[] = []

  const citizensJson = require('../../citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('passportId:', passportId)

    const citizen = citizensJson[passportId]
    // console.info('citizen:', citizen)

    const ethAddress: string = citizen.ownerAddress
    console.info('ethAddress:', ethAddress)

    // Look for Discourse username
    const username = await getDiscourseUsername(ethAddress)
    console.info('username:', username)

    // Export to CSV
    const csvRow = {
      passport_id: passportId,
      owner_address: ethAddress.toLowerCase(),
      discourse_username: username
    }
    csvRows.push(csvRow)
  }
  
  console.info('Writing CSV to file: ' + outputFilePath)
  writer.writeRecords(csvRows)
}

async function getDiscourseUsername(address: string): Promise<string> {
  console.info('getDiscourseUsername')
  return await discourseContract.usernames(address)
}

export {}
