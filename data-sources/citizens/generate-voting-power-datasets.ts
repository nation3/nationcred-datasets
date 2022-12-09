/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

const Web3 = require('web3')
const VotingEscrow = require('./abis/VotingEscrow.json')
const csvWriter = require('csv-writer')
const fs = require('fs')
const ethers = require('ethers')
const EthDater = require('ethereum-block-by-date')

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const dater = new EthDater(web3)
console.info('dater:', dater)

const ethersProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth')
console.info('ethersProvider:', ethersProvider)

const VotingEscrowContract = new web3.eth.Contract(VotingEscrow.abi, '0xf7def1d2fbda6b74bee7452fdf7894da9201065d')
console.info('VotingEscrowContract._address:', VotingEscrowContract._address)

loadVotingPowerData()

async function loadVotingPowerData() {
  console.info('loadVotingPowerData')

  const citizensJson = require('./output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('passportId:', passportId)

    const citizen = citizensJson[passportId]
    console.info('citizen:', citizen)

    const ethAddress: string = citizen.ownerAddress
    console.info('ethAddress:', ethAddress)

    const writer = createObjectCsvWriter({
      path: `output/citizen-${passportId}.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'block', title: 'block' },
        { id: 'voting_power', title: 'voting_power' }
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

      // Get Ethereum block by date
      const blockByDate = await dater.getDate(weekEndDate)
      // console.debug('blockByDate:', blockByDate)
      
      // Get Citizen's voting power at the current block
      const votingPowerWei: number = await getVotingPowerAtBlock(ethAddress, blockByDate.block)
      console.info('votingPowerWei:', votingPowerWei)
      const votingPowerEther: number = web3.utils.fromWei(votingPowerWei)
      console.info('votingPowerEther:', votingPowerEther)
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        block: blockByDate.block,
        voting_power: votingPowerEther
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
    }

    writer.writeRecords(csvRows)
  }
}

async function getVotingPowerAtBlock(ethAddress: string, blockNumber: number): Promise<number> {
  console.info('getVotingPowerAtBlock')
  return await VotingEscrowContract.methods.balanceOfAt(ethAddress, blockNumber).call()
}
