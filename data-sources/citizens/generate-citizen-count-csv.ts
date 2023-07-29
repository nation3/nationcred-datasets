const Web3 = require('web3')
const Passport = require('../abis/Passport.json')
const csvWriter = require('csv-writer')
const fs = require('fs')
const Papa = require('papaparse')

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const PassportContract = new web3.eth.Contract(
  Passport.abi,
  '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333'
)
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
      { id: 'new_citizens', title: 'new_citizens' },
      { id: 'total_expired_passports', title: 'total_expired_passports' }
    ]
  })
  let csvRows = []

  const nextId: number = await getNextId()
  console.info('nextId:', nextId)

  let id: number = 0

  // Iterate every week from the week of [Sun May-29-2022 → Sun Jun-05-2022] until now
  const weekEndDate: Date = new Date('2022-06-05T00:00:00Z')
  console.info('weekEndDate:', weekEndDate)
  const nowDate: Date = new Date()
  console.info('nowDate:', nowDate)
  while (nowDate.getTime() > weekEndDate.getTime()) {
    const weekBeginDate: Date = new Date(weekEndDate.getTime() - 7*24*60*60*1000)
    console.info('week:', `[${weekBeginDate.toISOString()} → ${weekEndDate.toISOString()}]`)

    let newCitizensCount: number = 0
    while (await getTimestamp(id) < (weekEndDate.getTime() / 1000)) {
      console.info('id:', id)
      
      newCitizensCount++
      console.info('newCitizensCount:', newCitizensCount)
      
      id++
      if (id == nextId) {
        console.info('Reached last passport ID:', (nextId - 1))
        break
      }
    }

    const totalExpiredPassports: number = getTotalExpiredPassports(weekEndDate, id)
    console.info('totalExpiredPassports:', totalExpiredPassports)
    
    // Export to CSV
    const csvRow = {
      week_end: weekEndDate.toISOString().substring(0, 10),
      total_citizens: id,
      new_citizens: newCitizensCount,
      total_expired_passports: totalExpiredPassports
    }
    csvRows.push(csvRow)

    // Increase week end date by 7 days
    weekEndDate.setDate(weekEndDate.getDate() + 7)
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

function getTotalExpiredPassports(weekEndDate: Date, maxPassportID: number): number {
  console.info('getTotalExpiredPassports')

  const weekEndDateString: string = weekEndDate.toISOString().substring(0, 10)

  let totalExpiredPassports = 0
  for (let passportID = 0; passportID < maxPassportID; passportID++) {
    console.info(`weekEndDate: ${weekEndDateString}, passportID: ${passportID}`)

    // Fetch voting power data from the citizen's data CSV
    const citizenFilePath: string = `output/citizen-${passportID}.csv`
    console.info('Fetching citizen data:', citizenFilePath)
    const file: File = fs.readFileSync(citizenFilePath)
    const csvData = file.toString()
    // console.info('csvData:\n', csvData)
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result: any) => {
        // console.info('result:', result)
        result.data.forEach((row: any, i: number) => {
          if (row.week_end == weekEndDateString) {
            console.info(`row.week_end ${row.week_end}, row.voting_power: ${row.voting_power}`)
            if (row.voting_power < 1.5) {
              // https://etherscan.io/address/0x279c0b6bfcbba977eaf4ad1b2ffe3c208aa068ac#readContract#F9
              console.info('Passport ID expired:', passportID)
              totalExpiredPassports++
            }
          }
        })
      }
    })
  }

  return totalExpiredPassports
}

export {}
