// https://documenter.getpostman.com/view/23226498/VVBUxRi6#90295a28-78e7-4ab0-b008-8bdca034621a

export interface UserReputation {
  responseTime: number;
  data:         Data;
}

export interface Data {
  ensName:         string;
  githubUserName:  null;
  address:         string;
  id:              number;
  delegates:       Delegate[];
}

export interface Delegate {
  logoUrl:               string;
  name:                  string;
  daoName:               string;
  isForumVerified:       boolean;
  forumTopicURL:         string;
  twitterHandle:         null;
  socialLinks:           SocialLinks;
  score:                 number;
  snapshotId:            string[];
  onChainId:             string;
  address:               string;
  stats:                 Stat[];
  delegatorCount:        null;
  delegatedVotes:        null;
  firstTokenDelegatedAt: null;
}

export interface SocialLinks {
  discord:        string;
  discordGuildId: string;
  forum:          string;
  logoUrl:        string;
  snapshot:       string;
  tally:          null;
  twitter:        null;
}

export interface Stat {
  period:               string;
  karmaScore:           number;
  karmaRank:            number;
  forumActivityScore:   number;
  forumLikesReceived:   number;
  forumPostsReadCount:  number;
  proposalsInitiated:   number;
  proposalsDiscussed:   number;
  forumTopicCount:      number;
  forumPostCount:       number;
  offChainVotesPct:     number;
  onChainVotesPct:      number | null;
  updatedAt:            Date;
  createdAt:            Date;
  percentile:           number;
  gitcoinHealthScore:   null;
  voteWeight:           null;
  deworkTasksCompleted: number;
  deworkPoints:         number;
  proposalsOnSnapshot:  number | null;
}
