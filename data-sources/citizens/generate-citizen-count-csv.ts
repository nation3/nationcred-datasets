export {}

const Web3 = require('web3')
const Passport = require('./abis/Passport.json')
const csvWriter = require('csv-writer')
const fs = require('fs')

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const PassportContract = new web3.eth.Contract(Passport.abi, '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333')
console.info('PassportContract._address:', PassportContract._address)

loadPassportMintsByWeek()

/**
 * Counts the total number of passport NFTs minted each week, and exports the numbers to a CSV file.
 */
async function loadPassportMintsByWeek() {
  console.info('loadPassportMintsByWeek')

  const writer = csvWriter.createObjectCsvWriter({
    path: 'output/citizen-count-per-week.csv',
    header: [
      { id: 'week_end', title: 'week_end' },
      { id: 'total_citizens', title: 'total_citizens' },
      { id: 'active_citizens', title: 'active_citizens' }
    ]
  })
  let csvRows = []

  const nextId: number = await getNextId()
  console.info('nextId:', nextId)

  // The first NFT passport was minted on Sunday May-29-2022 04:13:24 PM +UTC:  https://etherscan.io/tx/0x688d147d2e23192eef6acb567feba2ef6b2e4838e8fe79933984e87170c3dc78
  const weekEndDate: Date = new Date('2022-06-05T00:00:00Z')
  console.info('weekEndDate:', weekEndDate)

  // Iterate all passport NFTs, and count how many were minted by the end of each week
  let id: number = 0;
  let weekCount: number = 0
  for (id = 0; id < nextId; id++) {
    console.info('id:', id)

    const timestamp: number = await getTimestamp(id)
    console.info('timestamp:', timestamp)

    weekCount++
    
    while (timestamp > (weekEndDate.getTime() / 1_000)) {
      // Export previous week's count to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        total_citizens: weekCount,
        active_citizens: 0  // TODO: Fetch from https://github.com/nation3/nationcred-datasets/tree/main/nationcred
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
      console.info('weekEndDate:', weekEndDate)
    }    
  }
  
  writer.writeRecords(csvRows)
}

async function getNextId(): Promise<number> {
  console.info('getNextId')
  return await PassportContract.methods.getNextId().call()
}

async function getTimestamp(id: number): Promise<number> {
  console.info('getTimestamp')
  return await PassportContract.methods.timestampOf(id).call()
}

// // Get past "Transfer" events:  https://etherscan.io/address/0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333#events
// PassportContract.getPastEvents(
//     'Transfer',
//     {
//       fromBlock: 14866289  // https://etherscan.io/tx/0x1239b1efc6d595e530b14a607b9bc0f492f9b60b8304013ef1721669c7457ecb
//     },
//     function(error, events) {
//       console.error('error:', error)
//       console.info('events:', events)
//     }
// )
//   .then(function(events) {
//     console.info('then, events:', events)
//   })
