interface SCAlias {
  address: string
  description: string
}

interface SCIdentity {
  id: string
  subtype: string
  name: string
  address: string
  aliases: SCAlias[]
}

interface CredGrainViewParticipantPlusWallet {
  active: string
  identity: SCIdentity
  cred: number
  credPerInterval: number[]
  grainEarned: string
  grainEarnedPerInterval: string[]
  walletAddress: string[]
}

interface Interval {
  startTimeMs: number
  endTimeMs: number
  startDate: string
  endDate: string
}
