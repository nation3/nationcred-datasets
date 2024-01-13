const fs = require('fs')
const Papa = require('papaparse')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

generate()

async function generate() {
  console.log('generate')

  const writer = createObjectCsvWriter({
    path: `output/nationcred-scores.csv`,
    header: [
      { id: 'passport_id', title: 'passport_id' },
      { id: 'nationcred_score', title: 'nationcred_score' },
      { id: 'nationcred_score_accumulated', title: 'nationcred_score_accumulated' }
    ]
  })
  const csvRows = []

  const citizensJson = require('../../data-sources/citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.log('passportId:', passportId)

    // Load the Citizen's NationCred dataset
    const nationCredFilePath = `../nationcred/output/nationcred-${passportId}.csv`
    console.log('nationCredFilePath:', nationCredFilePath)
    let nationCredData = []
    if (!fs.existsSync(nationCredFilePath)) {
      console.error('File does not exist')
    } else {
      nationCredData = await loadCSVData(nationCredFilePath)
    }

    let nationCredScore = 0
    let nationCredScoreAccumulated = 0
    nationCredData.forEach((dataRow: any) => {
      if (dataRow.nationcred_score != undefined) {
        nationCredScore = Number(dataRow.nationcred_score),
        nationCredScoreAccumulated += nationCredScore
      }
    })
      
    // Export to CSV
    const csvRow = {
      passport_id: passportId,
      nationcred_score: nationCredScore,
      nationcred_score_accumulated: nationCredScoreAccumulated.toFixed(2)
    }
    csvRows.push(csvRow)

  }
  writer.writeRecords(csvRows)
}

async function loadCSVData(filePath: string): Promise<any> {
  console.info('loadCSVData')

  const dataFile: File = fs.readFileSync(filePath)
  const csvData = dataFile.toString()
  // console.debug('csvData:\n', csvData)

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
