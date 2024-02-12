/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

const VotingEscrow = require('../abis/VotingEscrow.json')
import { ethers } from 'ethers'
const EthDater = require('ethereum-block-by-date')

const ethersProvider = new ethers.JsonRpcProvider(
  'https://ethereum.publicnode.com'
)
console.info('ethersProvider:', ethersProvider)

const dater = new EthDater(ethersProvider)
console.info('dater:', dater)

const votingEscrowContract = new ethers.Contract(
  '0xf7def1d2fbda6b74bee7452fdf7894da9201065d',
  VotingEscrow.abi,
  ethersProvider
)

loadVotingEscrowData()

async function loadVotingEscrowData() {
  console.info('loadVotingEscrowData')

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
        { id: 'voting_escrow', title: 'voting_escrow' }
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
      
      // Get Citizen's voting escrow at the current block
      const votingEscrowWei: number = await getVotingEscrowAtBlock(ethAddress, blockByDate.block)
      console.info('votingEscrowWei:', votingEscrowWei)
      const votingEscrowEther: string = ethers.formatUnits(votingEscrowWei)
      console.info('votingEscrowEther:', votingEscrowEther)
      const votingEscrowRounded: string = new Number(votingEscrowEther).toFixed(2)
      console.info('votingEscrowRounded:', votingEscrowRounded)
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        block: blockByDate.block,
        voting_escrow: votingEscrowRounded
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
    }

    writer.writeRecords(csvRows)
  }
}

async function getVotingEscrowAtBlock(ethAddress: string, blockNumber: number): Promise<number> {
  console.info('getVotingEscrowAtBlock')
  return await votingEscrowContract.balanceOfAt(ethAddress, blockNumber)
}
