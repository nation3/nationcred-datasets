const sc = require('sourcecred')
const Passport = require('../abis/Passport.json')
const Ethers = require('ethers')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

let provider = new Ethers.providers.AnkrProvider()
let PassportContract = new Ethers.Contract(
  '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333',
  Passport.abi,
  provider
)

console.info('PassportContract.address:', PassportContract.address)

const SOURCECRED_URL =
  'https://raw.githubusercontent.com/nation3/nationcred-instance/gh-pages/'

loadSourceCredData()

async function loadSourceCredData() {
  console.info('loadSourceCredData')

  const instance =
    sc.sourcecred.instance.readInstance.getNetworkReadInstance(SOURCECRED_URL)
  const credGrainView = await instance.readCredGrainView()
  const ledger = await instance.readLedger()

  console.info(`Loaded N3 SourceCred instance`)

  let intervalsWeCareAbout: Array<[Interval, number]> =
    buildIntervals(credGrainView)

  const peopleWhoDidStuffMap = getParticipantsWhoParticipated(
    ledger,
    credGrainView
  )

  const nextId: number = await getNextId()
  console.info('nextId:', nextId)

  let passportId: number
  for (passportId = 0; passportId < nextId; passportId++) {
    console.info('passportId:', passportId)

    const signerAddress: string = await getSigner(passportId)
    console.info('signerAddress:', signerAddress)

    const writer = createObjectCsvWriter({
      path: `output/sourcecred-${signerAddress}.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'sourcecred_score', title: 'sourcecred_score' },
      ],
    })
    const csvRows: any[] = []

    let participant: CredGrainViewParticipantPlusWallet[] | undefined =
      peopleWhoDidStuffMap.get(signerAddress)

    console.info(
      `${passportId} linked to wallet? ${participant ? ' - YES' : ' - NO'}`
    )

    intervalsWeCareAbout.forEach((interval) => {
      const csvRow = {
        week_end: interval[0].endDate,
        sourcecred_score: participant
          ? sumCredForIdentities(interval, participant)
          : 0,
      }
      csvRows.push(csvRow)
    })

    writer.writeRecords(csvRows)
  }
}

function sumCredForIdentities(
  interval: [Interval, number],
  participant: CredGrainViewParticipantPlusWallet[]
): number {
  return participant.reduce(
    (acc: number, el: CredGrainViewParticipantPlusWallet) => {
      return el.credPerInterval[interval[1]] > 0.01
        ? acc + el.credPerInterval[interval[1]]
        : acc
    },
    0
  )
}

function getParticipantsWhoParticipated(
  ledger: any,
  credGrainView: any
): Map<string, CredGrainViewParticipantPlusWallet[]> {
  console.info(`getParticipantsWhoParticipated`)
  const peopleWhoDidStuff: CredGrainViewParticipantPlusWallet[] = []
  credGrainView
    .participants()
    .forEach((participant: CredGrainViewParticipantPlusWallet) => {
      const anyCred = participant.credPerInterval.some((cred) => cred > 0.01)
      if (anyCred) {
        console.info(
          `Participant ${participant.identity.name} participated, trying to fetch their wallet address`
        )
        const account = ledger.accountByName(participant.identity.name)
        if (account.payoutAddresses.size > 0) {
          participant.walletAddress = Array.from(
            account.payoutAddresses.values()
          )
        }
        peopleWhoDidStuff.push(participant)
      }
    })

  console.info(
    `${peopleWhoDidStuff.length} active participants ever (Cred greater than 0.01 in any 1 week )`
  )

  console.info(`Creating a Map keyed on wallet addresses`)

  const peopleWhoDidtuffMap = peopleWhoDidStuff.reduce(
    (
      acc: Map<string, CredGrainViewParticipantPlusWallet[]>,
      el: CredGrainViewParticipantPlusWallet
    ) => {
      el.walletAddress?.forEach((address: string) => {
        acc.get(address) ? acc.get(address)?.push(el) : acc.set(address, [el])
      })
      return acc
    },
    new Map<string, CredGrainViewParticipantPlusWallet[]>()
  )

  console.info(
    `Returning ${peopleWhoDidtuffMap.size} participants who have wallet addresses in SourceCred`
  )

  return peopleWhoDidtuffMap
}

function buildIntervals(credGrainView: any): Array<[Interval, number]> {
  //intervals in SC are 1 week and run from sunday midnight UTC to sunday midnight UTC
  //the intervals list in the credGrainView facilitates indexing into the cred array on
  //each participant
  //we are interested in data since 29/05/2022
  const startDate: number = new Date('2022-05-29').setUTCHours(0, 0, 0, 0)

  console.info(
    `Building interval map starting at week ending ${new Date(
      startDate
    ).toUTCString()}`
  )

  let intervalsWeCareAbout: Array<[Interval, number]> = []
  const now = Date.now()
  credGrainView.intervals().forEach((interval: Interval, index: number) => {
    if (interval.endTimeMs < startDate || interval.endTimeMs > now) return
    interval.endDate = new Date(interval.endTimeMs)
      .toISOString()
      .substring(0, 10)
    interval.startDate = new Date(interval.startTimeMs)
      .toISOString()
      .substring(0, 10)
    intervalsWeCareAbout.push([interval, index])
  })

  return intervalsWeCareAbout
}

async function getNextId(): Promise<number> {
  console.info('getNextId')
  return await PassportContract.getNextId()
}

async function getSigner(passportId: number): Promise<string> {
  console.info('getSigner')
  return await PassportContract.signerOf(passportId)
}
