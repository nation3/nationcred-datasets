const fs = require('fs')
const csvParser = require('csv-parser')
const jsonfile = require('jsonfile')

convertToJSON()

/**
 * Fetches data from citizens.csv and converts the data to JSON format.
 */
async function convertToJSON() {
  console.info('convertToJSON')

  let citizenObjects = {}

  const csvFilePath: string = 'output/citizens.csv'
  console.info('csvFilePath:', csvFilePath)

  const jsonFilePath: string = 'output/citizens.json'
  console.info('jsonFilePath:', jsonFilePath)

  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on('data', (row) => {
      console.info('on data, row.passport_id:', row.passport_id)

      const passportID: number = Number(row.passport_id)
      const ethAddress: string = row.eth_address
      const ensName: string = row.ens_name
      const votingPower: number = Number(row.voting_power)

      if (passportID >= 0) {
        const citizenObject = {
          passportId: passportID,
          ethAddress: ethAddress,
          ensName: ensName,
          votingPower: votingPower
        }

        citizenObjects[passportID] = citizenObject
      }
    })
    .on('end', () => {
      console.info('on end')

      // console.info('citizenObjects:\n', citizenObjects)

      console.info('Writing JSON to file: ' + jsonFilePath)
      jsonfile.writeFile(jsonFilePath, citizenObjects, { spaces: 2 }, function(err) {
        console.info('writeFile complete')
        if (err) {
          console.error('err:', err)
        }
      })
    })
}
