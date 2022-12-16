const fs = require('fs')
const csvParser = require('csv-parser')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

loadNationCredData()

async function loadNationCredData() {
  console.info('loadNationCredData')

  const citizensJson = require('../../data-sources/citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('passportId:', passportId)

    const writer = createObjectCsvWriter({
      path: `output/nationcred-${passportId}.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'value_creation_hours', title: 'value_creation_hours' },
        { id: 'governance_hours', title: 'governance_hours' },
        { id: 'operations_hours', title: 'operations_hours' },
        { id: 'nationcred_score', title: 'nationcred_score' }
      ]
    })
    const csvRows = []

    // Load the Citizen's SourceCred dataset
    // TODO

    // Load the Citizen's Dework dataset
    // TODO

    // Load the Citizen's Karma dataset
    // TODO

    // Load the Citizen's Snapshot dataset
    // TODO

    // Iterate every week from the week of [Sun May-29-2022 → Sun Jun-05-2022] until now
    const weekEndDate: Date = new Date('2022-06-05T00:00:00Z')
    console.info('weekEndDate:', weekEndDate)
    const nowDate: Date = new Date()
    console.info('nowDate:', nowDate)
    while (nowDate.getTime() > weekEndDate.getTime()) {
      const weekBeginDate: Date = new Date(weekEndDate.getTime() - 7*24*60*60*1000)
      console.info('week:', `[${weekBeginDate.toISOString()} → ${weekEndDate.toISOString()}]`)

      // Calculate the number of hours dedicated to Nation3 value creation by the Citizen
      // TODO
      
      // Calculate the number of hours dedicated to Nation3 governance by the Citizen
      // TODO

      // Calculate the number of hours dedicated to Nation3 operations by the Citizen
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        value_creation_hours: undefined,
        governance_hours: undefined,
        operations_hours: undefined,
        nationcred_score: undefined
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
    }

    writer.writeRecords(csvRows)
  }
}
