import { Delegate, Stat } from './KarmaTypes'
const fs = require('fs')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

loadKarmaData()

async function loadKarmaData() {
  console.info('loadKarmaData')

  const weekEndDate: Date = new Date()
  console.info('weekEndDate:', weekEndDate)

  const citizensJson = require('../../citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('passportId:', passportId)

    const citizen = citizensJson[passportId]
    console.info('citizen:', citizen)

    const ethAddress: string = citizen.ownerAddress
    console.info('ethAddress:', ethAddress)

    const outputFilePath = `output/karma-${passportId}.csv`
    console.info('outputFilePath:', outputFilePath)

    // let append = false
    // if (fs.existsSync(outputFilePath)) {
    //   append = true
    // }
    // console.info('append:', append)

    const writer = createObjectCsvWriter({
      path: outputFilePath,
      // append: append,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'karma_score', title: 'karma_score' },
        { id: 'karma_score_7d', title: 'karma_score_7d' },
        { id: 'forum_activity_score_7d', title: 'forum_activity_score_7d' },
      ],
    })
    interface CsvRow {
      week_end: string
      karma_score: number
      karma_score_7d: number
      forum_activity_score_7d: number
    }
    const csvRows: CsvRow[] = []

    const response: Response = await fetch(
      `https://api.showkarma.xyz/api/user/${ethAddress}`
    )
    const json = await response.json()
    // console.info('json:', json)
    if (!response.ok) {
      console.error('response.status:', response.status)
      continue
    }

    const delegates: Delegate[] = json.data.delegates
    // console.info('delegates:', delegates)
    delegates.forEach((delegate: Delegate) => {
      if (delegate.daoName == 'nation3') {
        delegate.stats.forEach((stat: Stat) => {
          if (stat.period == '7d') {
            console.info('stat:', stat)

            // Export to CSV
            const csvRow: CsvRow = {
              week_end: weekEndDate.toISOString().substring(0, 10),
              karma_score: delegate.score,
              karma_score_7d: stat.karmaScore,
              forum_activity_score_7d: stat.forumActivityScore,
            }
            csvRows.push(csvRow)
          }
        })
      }
    })

    if (csvRows.length > 0) {
      writer.writeRecords(csvRows)
    }
  }
}
