import { Channel } from './sc-enums'

export interface SCAlias {
  address: string
  description: string
}

export interface SCIdentity {
  id: string
  subtype: string
  name: string
  address: string
  aliases: SCAlias[]
}

export interface CredGrainViewParticipantPlusWallet {
  active: string
  identity: SCIdentity
  cred: number
  credPerInterval: number[]
  grainEarned: string
  grainEarnedPerInterval: string[]
  walletAddress: string[]
  channel?: Channel
}

export interface Interval {
  startTimeMs: number
  endTimeMs: number
  startDate: string
  endDate: string
}

export interface Cred {
  sourcecred: number
  discord: number
  discourse: number
  github: number
}
