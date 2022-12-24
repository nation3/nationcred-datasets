const fs = require('fs')
const Papa = require('papaparse')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

loadActivityData()

async function loadActivityData() {
  console.info('loadActivityData')

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

    // Get the current week's active Citizens
    const activeCitizens: any[] = []

    const citizensJson = require('../../data-sources/citizens/output/citizens.json')
    for (const passportId in citizensJson) {
      console.info('passportId:', passportId)
  
      // Load the Citizen's NationCred dataset
      const nationCredFilePath = `output/nationcred-${passportId}.csv`
      console.info('nationCredFilePath:', nationCredFilePath)
      let nationCredData = []
      if (!fs.existsSync(nationCredFilePath)) {
        console.error('File does not exist')
      } else {
        nationCredData = await loadNationCredData(nationCredFilePath)
      }
      console.info('nationCredData:', nationCredData)

      // Lookup the matching week
      nationCredData.forEach((dataRow: any) => {
        const weekEnd = dataRow.week_end
        // console.info('weekEnd:', weekEnd)
        if (weekEnd == weekEndDate.toISOString().substring(0, 10)) {
          const isActive = (dataRow.is_active === 'true')
          console.info('isActive', isActive)
          if (isActive) {
            activeCitizens[activeCitizens.length] = passportId
          }
        }
      })
    }
    console.info('activeCitizens:', activeCitizens)
    
    // Export to CSV
    const csvRow = {
      week_end: weekEndDate.toISOString().substring(0, 10),
      total_citizens_count: undefined,
      voting_citizens_count: undefined,
      active_citizens_count: activeCitizens.length,
      active_citizens: activeCitizens
    }
    csvRows.push(csvRow)

    // Increase week end date by 7 days
    weekEndDate.setDate(weekEndDate.getDate() + 7)
  }

  writer.writeRecords(csvRows)
}

async function loadNationCredData(filePath: string): Promise<any> {
  console.info('loadNationCredData')

  const nationCredFile: File = fs.readFileSync(filePath)
  const csvData = nationCredFile.toString()
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
