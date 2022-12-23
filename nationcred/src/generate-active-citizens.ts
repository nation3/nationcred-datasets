const fs = require('fs')
const Papa = require('papaparse')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

loadActivityData()

async function loadActivityData() {
  console.info('loadActivityData')

  const citizensJson = require('../../data-sources/citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('passportId:', passportId)

    const writer = createObjectCsvWriter({
      path: `output/nationcred-active-citizens.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'total_citizens_count', title: 'total_citizens_count' },
        { id: 'voting_citizens_count', title: 'voting_citizens_count' },
        { id: 'active_citizens_count', title: 'active_citizens_count' },
        { id: 'active_citizens', title: 'active_citizens' }
      ]
    })
    const csvRows = []

    // Iterate every week from the week of [Sun May-29-2022 → Sun Jun-05-2022] until now
    const weekEndDate: Date = new Date('2022-06-05T00:00:00Z')
    console.info('weekEndDate:', weekEndDate)
    const nowDate: Date = new Date()
    console.info('nowDate:', nowDate)
    while (nowDate.getTime() > weekEndDate.getTime()) {
      const weekBeginDate: Date = new Date(weekEndDate.getTime() - 7*24*60*60*1000)
      console.info('week:', `[${weekBeginDate.toISOString()} → ${weekEndDate.toISOString()}]`)
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        total_citizens_count: undefined,
        voting_citizens_count: undefined,
        active_citizens_count: undefined,
        active_citizens: []
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
    }

    writer.writeRecords(csvRows)
  }
}

export {}
