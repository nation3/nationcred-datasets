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
        { id: 'nationcred_score', title: 'nationcred_score' },
        { id: 'nationcred_score_accumulated', title: 'nationcred_score_accumulated' },
        { id: 'is_active', title: 'is_active' }
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
      sourceCredData = await loadCSVData(sourceCredFilePath)
    }
    // console.info('sourceCredData:', sourceCredData)

    // Load the Citizen's Coordinape dataset
    const coordinapeFilePath = `../data-sources/coordinape/output/coordinape-${passportId}.csv`
    console.info('coordinapeFilePath:', coordinapeFilePath)
    let coordinapeData = []
    if (!fs.existsSync(coordinapeFilePath)) {
      console.error('File does not exist')
    } else {
      coordinapeData = await loadCSVData(coordinapeFilePath)
    }
    // console.info('coordinapeData:', coordinapeData)

    // Load the Citizen's Dework dataset
    // TODO

    // Load the Citizen's Karma dataset
    // TODO

    // Load the Citizen's Snapshot dataset
    const snapshotFilePath = `../data-sources/snapshot/output/snapshot-${passportId}.csv`
    console.info('snapshotFilePath:', snapshotFilePath)
    let snapshotData = []
    if (!fs.existsSync(snapshotFilePath)) {
      console.error('File does not exist')
    } else {
      snapshotData = await loadCSVData(snapshotFilePath)
    }
    // console.info('snapshotData:', snapshotData)

    // Prepare variables for keeping track of NationCred scores during the past 4 weeks
    let nationCredScore4WeeksAgo = undefined
    let nationCredScore3WeeksAgo = undefined
    let nationCredScore2WeeksAgo = undefined
    let nationCredScore1WeekAgo = undefined

    let nationCredScoreAccumulated = 0

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
        if (weekEnd == weekEndDate.toISOString().substring(0, 10)) {
          sourceCredScore = dataRow.sourcecred_score
        }
      })
      console.info('sourceCredScore:', sourceCredScore)
      const sourceCredHours: number = sourceCredScore / 3.125
      console.info('sourceCredHours:', sourceCredHours)
      valueCreationHours += sourceCredHours

      let coordinapeMarketingHours = 0
      coordinapeData.forEach((dataRow: any) => {
        const weekEnd = dataRow.week_end
        if (weekEnd == weekEndDate.toISOString().substring(0, 10)) {
          coordinapeMarketingHours = Number(dataRow.marketing_hours)
        }
      })
      console.info('coordinapeMarketingHours:', coordinapeMarketingHours)
      valueCreationHours += coordinapeMarketingHours
      
      // Calculate the number of hours dedicated to Nation3 governance by the Citizen
      let governanceHours = 0

      let snapshotScore = 0
      snapshotData.forEach((dataRow: any) => {
        const weekEnd = dataRow.week_end
        if (weekEnd == weekEndDate.toISOString().substring(0, 10)) {
          const votesCount: number = dataRow.votes_count
          const proposalsCount: number = dataRow.proposals_count
          snapshotScore = (votesCount * 0.17) + (proposalsCount * 0.67) // Assume ~10 minutes dedicated per vote and ~40 minutes per proposal - https://forum.nation3.org/t/poll-how-much-time-do-you-spend-on-each-snapshot-vote/818
        }
      })
      console.info('snapshotScore:', snapshotScore)
      governanceHours += snapshotScore

      // Calculate the number of hours dedicated to Nation3 operations by the Citizen
      let operationsHours = 0
      
      let coordinapeOpsHours = 0
      coordinapeData.forEach((dataRow: any) => {
        const weekEnd = dataRow.week_end
        if (weekEnd == weekEndDate.toISOString().substring(0, 10)) {
          coordinapeOpsHours = Number(dataRow.ops_hours)
        }
      })
      console.info('coordinapeOpsHours:', coordinapeOpsHours)
      operationsHours += coordinapeOpsHours

      // Calculate the Citizen's final NationCred score
      const nationCredScore: number = valueCreationHours + governanceHours + operationsHours
      console.info('nationCredScore:', nationCredScore)

      nationCredScoreAccumulated += nationCredScore

      // Check the if the Citizen is active or not (based on the NationCred score for the past 4 weeks)
      nationCredScore4WeeksAgo = nationCredScore3WeeksAgo
      nationCredScore3WeeksAgo = nationCredScore2WeeksAgo
      nationCredScore2WeeksAgo = nationCredScore1WeekAgo
      nationCredScore1WeekAgo = nationCredScore
      const activeThreshold = 1.00
      const isActive = (nationCredScore4WeeksAgo && (nationCredScore4WeeksAgo > activeThreshold))
                    && (nationCredScore3WeeksAgo && (nationCredScore3WeeksAgo > activeThreshold))
                    && (nationCredScore2WeeksAgo && (nationCredScore2WeeksAgo > activeThreshold))
                    && (nationCredScore1WeekAgo && (nationCredScore1WeekAgo > activeThreshold))
      console.info('isActive:', isActive)
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        value_creation_hours: Number(valueCreationHours.toFixed(2)),
        governance_hours: Number(governanceHours.toFixed(2)),
        operations_hours: Number(operationsHours.toFixed(2)),
        nationcred_score: Number(nationCredScore.toFixed(2)),
        nationcred_score_accumulated: Number(nationCredScoreAccumulated.toFixed(2)),
        is_active: Boolean(isActive)
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
    }

    writer.writeRecords(csvRows)
  }
}

async function loadCSVData(filePath: string): Promise<any> {
  console.info('loadCSVData')

  const dataFile: File = fs.readFileSync(filePath)
  const csvData = dataFile.toString()
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

export {}
