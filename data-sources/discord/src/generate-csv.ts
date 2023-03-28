const csvWriter = require('csv-writer')
const Web3 = require('web3')
const ethers = require('ethers')
const Discord = require('../abis/Discord.json')

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const DiscordContract = new web3.eth.Contract(Discord.abi, '0x3415f4ffb9f89fba0ab446da4a78223e4cd73bad')
console.info('DiscordContract._address:', DiscordContract._address)

generateData()

/**
 * Fetches data from citizens.csv and looks up the Discord usernames.
 */
async function generateData() {
  console.info('generateData')

  const outputFilePath = 'output/discord-usernames.csv'
  console.info('outputFilePath:', outputFilePath)

  const writer = csvWriter.createObjectCsvWriter({
    path: outputFilePath,
    header: [
      { id: 'passport_id', title: 'passport_id' },
      { id: 'owner_address', title: 'owner_address' },
      { id: 'discord_username', title: 'discord_username' }
    ]
  })
  const csvRows: any[] = []

  const citizensJson = require('../../citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('\npassportId:', passportId)

    const citizen = citizensJson[passportId]
    // console.info('citizen:', citizen)

    const ethAddress: string = citizen.ownerAddress
    console.info('ethAddress:', ethAddress)

    // Look for Discord username
    const username = await getDiscordUsername(ethAddress)
    console.info('username:', username)

    // Export to CSV
    const csvRow = {
      passport_id: passportId,
      owner_address: ethAddress.toLowerCase(),
      discord_username: username
    }
    csvRows.push(csvRow)
  }
  
  console.info('Writing CSV to file: ' + outputFilePath)
  writer.writeRecords(csvRows)
}

async function getDiscordUsername(address: string): Promise<string> {
  console.info('getDiscordUsername')
  return await DiscordContract.methods.usernames(address).call()
}

export {}
