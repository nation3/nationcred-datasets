import { Delegate, Stat } from "./KarmaTypes"
const Passport = require('../abis/Passport.json')
const Web3 = require('web3')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const PassportContract = new web3.eth.Contract(Passport.abi, '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333')
console.info('PassportContract._address:', PassportContract._address)

loadKarmaData()

async function loadKarmaData() {
  console.info('loadKarmaData')

  const nextId: number = await getNextId()
  console.info('nextId:', nextId)

  const weekEndDate: Date = new Date()
  console.info('weekEndDate:', weekEndDate)

  let passportId: number
  for (passportId = 0; passportId < nextId; passportId++) {
    console.info('passportId:', passportId)

    const signerAddress: string = await getSigner(passportId)
    console.info('signerAddress:', signerAddress)

    const writer = createObjectCsvWriter({
      path: `output/karma-${signerAddress}.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'karma_score_30d', title: 'karma_score_30d' },
        { id: 'forum_activity_score_30d', title: 'forum_activity_score_30d' }
      ]
    })
    interface CsvRow {
      week_end: string,
      karma_score_30d: number,
      forum_activity_score_30d: number
    }
    const csvRows: CsvRow[] = []

    const response: Response = await fetch(`https://api.showkarma.xyz/api/user/${signerAddress}`)
    const json = await response.json()
    console.info('json:', json)
    if (!response.ok) {
      console.error('response.status:', response.status)
      continue
    }

    const delegates: Delegate[] = json.data.delegates
    console.info('delegates:', delegates)
    delegates.forEach((delegate: Delegate) => {
      if (delegate.daoName == 'nation3') {
        delegate.stats.forEach((stat: Stat) => {
          if (stat.period == '30d') { // TODO: replace with "7d" once available
            console.info('stat:', stat)

            // Export to CSV
            const csvRow: CsvRow = {
              week_end: weekEndDate.toISOString().substring(0, 10),
              karma_score_30d: stat.karmaScore,
              forum_activity_score_30d: stat.forumActivityScore
            }
            csvRows.push(csvRow)
          }
        })
      }
    })

    writer.writeRecords(csvRows)
  }
}

async function getNextId(): Promise<number> {
  console.info('getNextId')
  return await PassportContract.methods.getNextId().call()
}

async function getSigner(passportId: number): Promise<string> {
  console.info('getSigner')
  return await PassportContract.methods.signerOf(passportId).call()
}
