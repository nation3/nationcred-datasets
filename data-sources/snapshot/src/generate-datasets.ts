const fs = require('fs')
const { stringify } = require('csv-stringify')

const GRAPHQL_URL: string = 'https://hub.snapshot.org/graphql'
console.log('GRAPHQL_URL:', GRAPHQL_URL)

loadSnapshotData()

async function loadSnapshotData() {
  console.log('loadSnapshotData')

  const votesResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
        'content-type': 'application/json'
    },
    body: JSON.stringify({
        query: `
          query VotesQuery {
            votes (
              first: 1000
              where: {
                space: "nation3.eth"
              }
            ) {
              created
              voter
              proposal {
                id
                title
              }
            }
          }
        `
    })
  })
  const { data: votesData } = await votesResponse.json()
  console.log('votesData:', votesData)

  const proposalsResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
        'content-type': 'application/json'
    },
    body: JSON.stringify({
        query: `
          query ProposalsQuery{
            proposals (
              first: 1000
              where:{
                space: "nation3.eth"
              }
            ) {
              id
              title
              created
              author
            }
          }
        `
    })
  })
  const { data: proposalsData } = await proposalsResponse.json()
  console.log('proposalsData:', proposalsData)

  exportToCSV(votesData.votes, proposalsData.proposals)
}

function exportToCSV(votes: any, proposals: any) {
  console.log('exportToCSV');

  const citizensJson = require('../../citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.log('passportId:', passportId)

    const citizen = citizensJson[passportId]

    const filename = `output/snapshot-${passportId}.csv`
    const writeableStream = fs.createWriteStream(filename)
    const columns = [
        'week_end',
        'votes_count',
        'proposals_count'
    ]
    const stringifier = stringify({ header: true, columns: columns })

    // Iterate every week from the week of [Sun May-29-2022 → Sun Jun-05-2022] until now
    const weekEndDate: Date = new Date('2022-06-05T00:00:00Z')
    const nowDate: Date = new Date()
    while (nowDate.getTime() > weekEndDate.getTime()) {
      const weekBeginDate: Date = new Date(weekEndDate.getTime() - 7*24*60*60*1000)

      let votesCount: number = 0
      for (const vote of votes) {
        const voterAddress: string = String(vote.voter).toLowerCase()
        const voteCreatedTimestamp: Date = new Date(vote.created * 1_000)
        if ((voterAddress == citizen.ownerAddress)
            && (voteCreatedTimestamp.getTime() >= weekBeginDate.getTime())
            && (voteCreatedTimestamp.getTime() < weekEndDate.getTime())) {
          votesCount++
        }
      }

      let proposalsCount: number = 0
      for (const proposal of proposals) {
        const authorAddress: string = String(proposal.author).toLowerCase()
        const proposalCreatedTimestamp: Date = new Date(proposal.created * 1_000)
        if ((authorAddress == citizen.ownerAddress)
            && (proposalCreatedTimestamp.getTime() >= weekBeginDate.getTime())
            && (proposalCreatedTimestamp.getTime() < weekEndDate.getTime())) {
          proposalsCount++
        }
      }

      stringifier.write({
        'week_end': weekEndDate.toISOString().substring(0, 10),
        'votes_count': votesCount,
        'proposals_count': proposalsCount
      })

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
    }

    stringifier.pipe(writeableStream);
    console.log('Finished writing data to CSV:', filename);
  }
}
