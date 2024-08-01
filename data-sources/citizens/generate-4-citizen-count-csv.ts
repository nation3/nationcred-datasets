import { ethers } from 'ethers'
const Passport = require('../abis/Passport.json')
const csvWriter = require('csv-writer')
const fs = require('fs')
const Papa = require('papaparse')

const ethersProvider = new ethers.JsonRpcProvider(
  'https://lb.nodies.app/v1/5e9daed367d1454fab7c75f0ec8aceff'
)
console.debug('ethersProvider:', ethersProvider)

const passportContract = new ethers.Contract(
  '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333',
  Passport.abi,
  ethersProvider
)

loadPassportMintsByWeek()

/**
 * Counts the total number of passport NFTs minted each week, and exports the numbers to a CSV file.
 */
async function loadPassportMintsByWeek() {
  console.info('loadPassportMintsByWeek')

  // const revocations = await fetchRevocations()
  // console.debug('revocations:', revocations)

  const writer = csvWriter.createObjectCsvWriter({
    path: 'output/citizen-count-per-week.csv',
    header: [
      { id: 'week_end', title: 'week_end' },
      { id: 'total_citizens', title: 'total_citizens' },
      { id: 'new_citizens', title: 'new_citizens' },
      { id: 'total_expired_passports', title: 'total_expired_passports' },
      { id: 'total_revoked_passports', title: 'total_revoked_passports' }
    ]
  })
  let csvRows = []

  const nextId: number = await getNextId()
  console.debug('nextId:', nextId)

  let id: number = 0

  // Iterate every week from the week of [Sun May-29-2022 → Sun Jun-05-2022] until now
  const weekEndDate: Date = new Date('2022-06-05T00:00:00Z')
  console.debug('weekEndDate:', weekEndDate)
  const nowDate: Date = new Date()
  console.debug('nowDate:', nowDate)
  while (nowDate.getTime() > weekEndDate.getTime()) {
    const weekBeginDate: Date = new Date(weekEndDate.getTime() - 7*24*60*60*1000)
    console.debug('week:', `[${weekBeginDate.toISOString()} → ${weekEndDate.toISOString()}]`)

    let newCitizensCount: number = 0
    while ((id < nextId) && (await getTimestamp(id) < (weekEndDate.getTime() / 1000))) {
      console.debug('id:', id)
      
      newCitizensCount++
      console.debug('newCitizensCount:', newCitizensCount)
      
      id++
    }

    const totalExpiredPassports: number = getTotalExpiredPassports(weekEndDate, id)
    console.debug('totalExpiredPassports:', totalExpiredPassports)

    // const totalRevokedPassports: number = getTotalRevokedPassports(weekEndDate, id, revocations)
    const totalRevokedPassports: number = getTotalRevokedPassports(weekEndDate, id, new Array(nextId).fill(0))
    console.debug('totalRevokedPassports:', totalRevokedPassports)
    
    // Export to CSV
    const csvRow = {
      week_end: weekEndDate.toISOString().substring(0, 10),
      total_citizens: id,
      new_citizens: newCitizensCount,
      total_expired_passports: totalExpiredPassports,
      total_revoked_passports: totalRevokedPassports
    }
    csvRows.push(csvRow)

    // Increase week end date by 7 days
    weekEndDate.setDate(weekEndDate.getDate() + 7)
  }

  writer.writeRecords(csvRows)
}

async function getNextId(): Promise<number> {
  console.info('getNextId')
  return await passportContract.getNextId()
}

async function getTimestamp(id: number): Promise<number> {
  console.info('getTimestamp, id:', id)
  try {
    return await passportContract.timestampOf(id)
  } catch (err) {
    console.error('err:', err)
    return 0
  }
}

/**
 * Calculates the total number of expired passports up until `weekEndDate`
 */
function getTotalExpiredPassports(weekEndDate: Date, maxPassportID: number): number {
  console.info('getTotalExpiredPassports')

  const weekEndDateString: string = weekEndDate.toISOString().substring(0, 10)

  let totalExpiredPassports = 0
  for (let passportID = 0; passportID < maxPassportID; passportID++) {
    // console.debug(`weekEndDate: ${weekEndDateString}, passportID: ${passportID}`)

    // Fetch voting escrow data from the citizen's data CSV
    const citizenFilePath: string = `output/citizen-${passportID}.csv`
    // console.debug('Fetching citizen data:', citizenFilePath)
    const file: File = fs.readFileSync(citizenFilePath)
    const csvData = file.toString()
    // console.debug('csvData:\n', csvData)
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result: any) => {
        // console.debug('result:', result)
        result.data.forEach((row: any, i: number) => {
          if (row.week_end == weekEndDateString) {
            // console.debug(`row.week_end ${row.week_end}, row.voting_escrow: ${row.voting_escrow}`)
            if (row.voting_escrow < 1.5) {
              // https://etherscan.io/address/0x279c0b6bfcbba977eaf4ad1b2ffe3c208aa068ac#readContract#F9
              // console.debug('Passport ID expired:', passportID)
              totalExpiredPassports++
            }
          }
        })
      }
    })
  }

  return totalExpiredPassports
}

/**
 * Calculates the total number of revoked passports up until `weekEndDate`
 */
function getTotalRevokedPassports(weekEndDate: Date, maxPassportID: number, revocations: any): number {
  console.info('getTotalRevokedPassports')

  const weekEndDateString: string = weekEndDate.toISOString().substring(0, 10)

  let totalRevokedPassports = 0
  for (let passportID = 0; passportID < maxPassportID; passportID++) {
    // console.debug(`weekEndDate: ${weekEndDateString}, passportID: ${passportID}`)
    
    revocations.forEach((row: any, i: number) => {
      // console.debug('row:', row)
      const blockTimestamp: number = Number(row.blockTimestamp)
      const revocationDate: Date = new Date(blockTimestamp * 1_000)
      // console.debug('revocationDate:', revocationDate)
      if (revocationDate.getTime() <= weekEndDate.getTime()) {
        const tokenID: number = Number(row._tokenId)
        // console.debug('tokenID:', tokenID)
        if (tokenID == passportID) {
          console.debug('Passport ID revoked:', passportID)
          totalRevokedPassports++
        }
      }
    })
  }

  return totalRevokedPassports
}

async function fetchRevocations() {
  console.info('fetchRevocations')

  // https://github.com/nation3/subgraphs/blob/main/passportissuance/schema.graphql
  const GRAPHQL_URL: string = 'https://api.thegraph.com/subgraphs/name/nation3/passportissuance'
  const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      body: JSON.stringify({
          query: `
            {
              revokes(first: 420) {
                _tokenId
                blockTimestamp
              }
            }
          `
      })
  })

  const { data } = await response.json()
  console.debug('data:', data)

  return data.revokes
}

export {}
