import { Channel } from './sc-enums'
import {
  Cred,
  CredGrainViewParticipantPlusWallet,
  Interval,
  SCAlias,
} from './sc-types'

const sc = require('sourcecred')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

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

  const citizensJson = require('../../citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('passportId:', passportId)

    const citizen = citizensJson[passportId]
    console.info('citizen:', citizen)

    const ethAddress: string = citizen.ownerAddress
    console.info('ethAddress:', ethAddress)

    const writer = createObjectCsvWriter({
      path: `output/sourcecred-${passportId}.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'sourcecred_score', title: 'sourcecred_score' },
        { id: 'discord_score', title: 'discord_score' },
        { id: 'discourse_score', title: 'discourse_score' },
        { id: 'github_score', title: 'github_score' },
      ],
    })
    const csvRows: any[] = []

    let participant: CredGrainViewParticipantPlusWallet[] | undefined =
      peopleWhoDidStuffMap.get(ethAddress)

    console.info(
      `${passportId} linked to wallet? ${participant ? ' - YES' : ' - NO'}`
    )

    intervalsWeCareAbout.forEach((interval) => {
      const scForIdentity = participant
        ? sumCredForIdentities(interval, participant)
        : ({ sourcecred: 0, discord: 0, discourse: 0, github: 0 } as Cred)
      const csvRow = {
        week_end: interval[0].endDate,
        sourcecred_score: Number(scForIdentity.sourcecred.toFixed(2)),
        discord_score: Number(scForIdentity.discord.toFixed(2)),
        discourse_score: Number(scForIdentity.discourse.toFixed(2)),
        github_score: Number(scForIdentity.github.toFixed(2)),
      }
      csvRows.push(csvRow)
    })

    writer.writeRecords(csvRows)
  }
}

function sumCredForIdentities(
  interval: [Interval, number],
  participant: CredGrainViewParticipantPlusWallet[]
): Cred {
  let cred = { sourcecred: 0, discord: 0, discourse: 0, github: 0 } as Cred
  return participant.reduce(
    (acc: Cred, el: CredGrainViewParticipantPlusWallet) => {
      if (el.credPerInterval[interval[1]] > 0.01) {
        acc.sourcecred += el.credPerInterval[interval[1]]
        switch (el.channel) {
          case Channel.DISCORD:
            acc.discord += el.credPerInterval[interval[1]]
            break
          case Channel.DISCOURSE:
            acc.discourse += el.credPerInterval[interval[1]]
            break
          case Channel.GITHUB:
            acc.github += el.credPerInterval[interval[1]]
            break
        }
      }
      return acc
    },
    cred
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
          participant.channel = determineChannel(participant.identity.aliases)
          participant.walletAddress = Array.from(
            account.payoutAddresses.values()
          )
          participant.walletAddress = participant.walletAddress.map((address) =>
            address.toLowerCase()
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

function determineChannel(aliases: SCAlias[]): Channel | undefined {
  //We only handle single aliases for Nation3 - this will bite us if we merge aliases!
  const aliasDescription = aliases[0]?.description || ''

  if (aliasDescription.startsWith('discourse')) return Channel.DISCOURSE
  if (aliasDescription.startsWith('discord')) return Channel.DISCORD
  if (aliasDescription.startsWith('github')) return Channel.GITHUB
}

function buildIntervals(credGrainView: any): Array<[Interval, number]> {
  //intervals in SC are 1 week and run from sunday midnight UTC to sunday midnight UTC
  //the intervals list in the credGrainView facilitates indexing into the cred array on
  //each participant
  //we are interested in data since May-29-2022 04:13:24 PM +UTC
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
