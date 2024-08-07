# Citizens

https://etherscan.io/token/0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333#inventory

## Datasets
    
- `citizens.csv`

    - Contains the NFT Passport ID, owner/signer Ethereum address and ENS name (if any) of each Nation3 Citizen.  And the `voting_escrow` column is the Citizen's [`$veNATION`](https://wiki.nation3.org/token/#venation) balance.

    - The `owner_address` is the Ethereum address used for linking a Citizen to activity in Dework/GitHub/Karma/Snapshot/SourceCred.

- `citizens.json`

    - Same data as in `citizens.csv`, but stored in JSON format.

- `citizen-<passportId>.csv`

    - Contains a Citizen's voting escrow week by week.

- `citizen-count-peer-week.csv`

    - Contains the total number of Nation3 Citizens week by week, and the total number of [_active_](https://github.com/nation3/nationcred-datasets/tree/main/nationcred#definition-of-active) Citizens week by week.

## Install

```
npm install
```

## Build & Run

### Build

```
cd data-sources/citizens/
npm run build
```

### 1. Generate Citizen Data CSV

```
npm run generate-1-csv
```

### 2. Generate Citizen Data JSON

```
npm run generate-2-json
```

### 3. Generate Historical Citizen Voting Escrow Data CSVs

```
npm run generate-3-voting-escrow
```

### 4. Generate Citizen Count CSV

```
npm run generate-4-count
```
