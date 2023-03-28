const csvWriter = require('csv-writer')
const Web3 = require('web3')
const ethers = require('ethers')
const GitHub = require('../abis/GitHub.json')

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const ethersProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth')
console.info('ethersProvider:', ethersProvider)

const GitHubContract = new web3.eth.Contract(GitHub.abi, '0xb989c0c17a3bce679d7586d9e55b6eab11c18687')
console.info('GitHubContract._address:', GitHubContract._address)

generateData()

/**
 * Fetches data from citizens.csv and looks up the GitHub usernames.
 */
async function generateData() {
  console.info('generateData')

  const outputFilePath: string = 'output/github-usernames.csv'
  console.info('outputFilePath:', outputFilePath)

  const writer = csvWriter.createObjectCsvWriter({
    path: outputFilePath,
    header: [
      { id: 'passport_id', title: 'passport_id' },
      { id: 'owner_address', title: 'owner_address' },
      { id: 'github_username', title: 'github_username' },
      { id: 'github_username_ens', title: 'github_username_ens' }
    ]
  })
  let csvRows: any[] = []

  const citizensJson = require('../../citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('\npassportId:', passportId)

    const citizen = citizensJson[passportId]
    // console.info('citizen:', citizen)

    const ethAddress: string = citizen.ownerAddress
    console.info('ethAddress:', ethAddress)

    const ensName: string = citizen.ensName
    console.log('ensName:', ensName)
    
    let ensTextRecord = null
    if (ensName != "") {
      // Look for GitHub username in ENS text record (com.github)
      ensTextRecord = await getENSTextRecord(ensName)
      console.info('ensTextRecord:', ensTextRecord)
    }

    // Look for GitHub username
    const username = await getGitHubUsername(ethAddress)
    console.info('username:', username)

    // Export to CSV
    const csvRow = {
      passport_id: passportId,
      owner_address: ethAddress.toLowerCase(),
      github_username: username,
      github_username_ens: ensTextRecord
    }
    csvRows.push(csvRow)
  }
  
  console.info('Writing CSV to file: ' + outputFilePath)
  writer.writeRecords(csvRows)
}

async function getGitHubUsername(address: string): Promise<string> {
  console.info('getGitHubUsername')
  return await GitHubContract.methods.usernames(address).call()
}

async function getENSTextRecord(ensName: string): Promise<string> {
  console.info('getENSTextRecord')
  const resolver = await ethersProvider.getResolver(ensName)
  const textRecord = await resolver.getText('com.github')
  return textRecord
}

export {}
