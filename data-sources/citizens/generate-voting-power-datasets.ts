/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

const VotingEscrow = require('../abis/VotingEscrow.json')
import { ethers } from 'ethers'
const EthDater = require('ethereum-block-by-date')

const ethersProvider = new ethers.JsonRpcProvider(
  'https://rpc.ankr.com/eth'
)
console.info('ethersProvider:', ethersProvider)

const dater = new EthDater(ethersProvider)
console.info('dater:', dater)

const votingEscrowContract = new ethers.Contract(
  '0xf7def1d2fbda6b74bee7452fdf7894da9201065d',
  VotingEscrow.abi,
  ethersProvider
)

loadVotingPowerData()

async function loadVotingPowerData() {
  console.info('loadVotingPowerData')

  const citizensJson = require('../output/citizens.json')
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
      const votingPowerEther: string = ethers.formatUnits(votingPowerWei)
      console.info('votingPowerEther:', votingPowerEther)
      const votingPowerRounded: string = new Number(votingPowerEther).toFixed(2)
      console.info('votingPowerRounded:', votingPowerRounded)
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        block: blockByDate.block,
        voting_power: votingPowerRounded
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
  return await votingEscrowContract.balanceOfAt(ethAddress, blockNumber)
}
