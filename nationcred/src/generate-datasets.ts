const fs = require('fs')
const Papa = require('papaparse')

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
    const sourceCredFilePath = `../data-sources/sourcecred/output/sourcecred-${passportId}.csv`
    console.info('sourceCredFilePath:', sourceCredFilePath)
    let sourceCredData = []
    if (!fs.existsSync(sourceCredFilePath)) {
      console.error('File does not exist')
    } else {
      sourceCredData = await loadSourceCredData(sourceCredFilePath)
    }
    // console.info('sourceCredData:', sourceCredData)

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
      let valueCreationHours = 0

      let sourceCredScore = 0
      sourceCredData.forEach((dataRow: any) => {
        const weekEnd = dataRow.week_end
        // console.info('weekEnd:', weekEnd)
        if (weekEnd == weekEndDate.toISOString().substring(0, 10)) {
          sourceCredScore = dataRow.sourcecred_score
        }
      })
      console.info('sourceCredScore:', sourceCredScore)
      const sourceCredHours: number = sourceCredScore / 2.5
      console.info('sourceCredHours:', sourceCredHours)

      valueCreationHours += sourceCredHours
      
      // Calculate the number of hours dedicated to Nation3 governance by the Citizen
      const governanceHours = undefined
      // TODO

      // Calculate the number of hours dedicated to Nation3 operations by the Citizen
      const operationsHours = undefined
      // TODO

      // Calculate the Citizen's final NationCred score
      const nationCredScore: number = valueCreationHours//+ governanceHours + operationsHours
      console.info('nationCredScore:', nationCredScore)
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        value_creation_hours: Number(valueCreationHours.toFixed(2)),
        governance_hours: governanceHours,
        operations_hours: operationsHours,
        nationcred_score: Number(nationCredScore.toFixed(2))
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
    }

    writer.writeRecords(csvRows)
  }
}

async function loadSourceCredData(filePath: string): Promise<any> {
  console.info('loadSourceCredData')

  const sourceCredFile: File = fs.readFileSync(filePath)
  const csvData = sourceCredFile.toString()
  console.debug('csvData:\n', csvData)

  return new Promise(resolve => {
    Papa.parse(csvData, {
      header: true,
      complete: (results: any) => {
        console.log('complete')
        resolve(results.data)
      }
    })
  })
}
