const fs = require('fs')
const Papa = require('papaparse')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

loadCoordinapeData()

async function loadCoordinapeData() {
  console.log('loadCoordinapeData')

  // Load the Development Guild contributions
  const devContributionsFileUrl = 'https://raw.githubusercontent.com/nation3/citizen-rewards/main/development-guild/contributions/coordinape-contributions.csv'
  console.log('Fetching Development Guild contributions:', devContributionsFileUrl)
  const devContributionsResponse = await fetch(devContributionsFileUrl);
  console.log('devContributionsResponse.status:', devContributionsResponse.status)
  const devContributionsData = await devContributionsResponse.text()
  const devContributions = await parseContributionsCsv(devContributionsData)
  console.log('devContributions.length:', devContributions.length)

  // Load the EcoRide Network contributions
  const ecoRideContributionsFileUrl = 'https://raw.githubusercontent.com/nation3/citizen-rewards/main/ecoride-network/contributions/coordinape-contributions.csv'
  console.log('Fetching EcoRide Network contributions:', ecoRideContributionsFileUrl)
  const ecoRideContributionsResponse = await fetch(ecoRideContributionsFileUrl);
  console.log('ecoRideContributionsResponse.status:', ecoRideContributionsResponse.status)
  const ecoRideContributionsData = await ecoRideContributionsResponse.text()
  const ecoRideContributions = await parseContributionsCsv(ecoRideContributionsData)
  console.log('ecoRideContributions.length:', ecoRideContributions.length)

  // Load the Marketing Guild contributions
  const marketingContributionsFileUrl = 'https://raw.githubusercontent.com/nation3/citizen-rewards/main/marketing-guild/contributions/coordinape-contributions.csv'
  console.log('Fetching Marketing Guild contributions:', marketingContributionsFileUrl)
  const marketingContributionsResponse = await fetch(marketingContributionsFileUrl);
  console.log('marketingContributionsResponse.status:', marketingContributionsResponse.status)
  const marketingContributionsData = await marketingContributionsResponse.text()
  const marketingContributions = await parseContributionsCsv(marketingContributionsData)
  console.log('marketingContributions.length:', marketingContributions.length)

  // Load the Ops Guild contributions
  const opsContributionsFileUrl = 'https://raw.githubusercontent.com/nation3/citizen-rewards/main/ops-guild/contributions/coordinape-contributions.csv'
  console.log('Fetching Ops Guild contributions:', opsContributionsFileUrl)
  const opsContributionsResponse = await fetch(opsContributionsFileUrl);
  console.log('opsContributionsResponse.status:', opsContributionsResponse.status)
  const opsContributionsData = await opsContributionsResponse.text()
  const opsContributions = await parseContributionsCsv(opsContributionsData)
  console.log('opsContributions.length:', opsContributions.length)

  const citizensJson = require('../../../data-sources/citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.log('passportId:', passportId)

    const writer = createObjectCsvWriter({
      path: `output/coordinape-${passportId}.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'dev_contributions', title: 'dev_contributions' },
        { id: 'dev_hours', title: 'dev_hours' },
        { id: 'ecoride_contributions', title: 'ecoride_contributions' },
        { id: 'ecoride_hours', title: 'ecoride_hours' },
        { id: 'marketing_contributions', title: 'marketing_contributions' },
        { id: 'marketing_hours', title: 'marketing_hours' },
        { id: 'ops_contributions', title: 'ops_contributions' },
        { id: 'ops_hours', title: 'ops_hours' }
      ]
    })
    const csvRows = []

    // Iterate every week from the week of [Sun May-29-2022 → Sun Jun-05-2022] until now
    const weekEndDate: Date = new Date('2022-06-05T00:00:00Z')
    // console.log('weekEndDate:', weekEndDate)
    const nowDate: Date = new Date()
    // console.log('nowDate:', nowDate)
    while (nowDate.getTime() > weekEndDate.getTime()) {
      const weekBeginDate: Date = new Date(weekEndDate.getTime() - 7*24*60*60*1000)
      // console.log('week:', `[${weekBeginDate.toISOString()} → ${weekEndDate.toISOString()}]`)

      let devContributionsCount = 0
      let devContributionsHours = 0
      devContributions.forEach((dataRow: any) => {
        const updatedAt = new Date(dataRow.updated_at)
        if ((dataRow.passport_id == passportId)
            && (updatedAt.getTime() >= weekBeginDate.getTime())
            && (updatedAt.getTime() < weekEndDate.getTime())) {
          devContributionsCount++
          devContributionsHours += Number(dataRow.hours_spent)
        }
      })

      let ecoRideContributionsCount = 0
      let ecoRideContributionsHours = 0
      ecoRideContributions.forEach((dataRow: any) => {
        const updatedAt = new Date(dataRow.updated_at)
        if ((dataRow.passport_id == passportId)
            && (updatedAt.getTime() >= weekBeginDate.getTime())
            && (updatedAt.getTime() < weekEndDate.getTime())) {
          ecoRideContributionsCount++
          ecoRideContributionsHours += Number(dataRow.hours_spent)
        }
      })

      let marketingContributionsCount = 0
      let marketingContributionsHours = 0
      marketingContributions.forEach((dataRow: any) => {
        const updatedAt = new Date(dataRow.updated_at)
        if ((dataRow.passport_id == passportId)
            && (updatedAt.getTime() >= weekBeginDate.getTime())
            && (updatedAt.getTime() < weekEndDate.getTime())) {
          marketingContributionsCount++
          marketingContributionsHours += Number(dataRow.hours_spent)
        }
      })

      let opsContributionsCount = 0
      let opsContributionsHours = 0
      opsContributions.forEach((dataRow: any) => {
        const updatedAt = new Date(dataRow.updated_at)
        if ((dataRow.passport_id == passportId)
            && (updatedAt.getTime() >= weekBeginDate.getTime())
            && (updatedAt.getTime() < weekEndDate.getTime())) {
          opsContributionsCount++
          opsContributionsHours += Number(dataRow.hours_spent)
        }
      })
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        dev_contributions: devContributionsCount,
        dev_hours: devContributionsHours.toFixed(2),
        ecoride_contributions: ecoRideContributionsCount,
        ecoride_hours: ecoRideContributionsHours.toFixed(2),
        marketing_contributions: marketingContributionsCount,
        marketing_hours: marketingContributionsHours.toFixed(2),
        ops_contributions: opsContributionsCount,
        ops_hours: opsContributionsHours.toFixed(2)
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
    }

    writer.writeRecords(csvRows)
  }
}

async function parseContributionsCsv(csvData: string): Promise<any> {
  console.log('parseContributionsCsv')

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
