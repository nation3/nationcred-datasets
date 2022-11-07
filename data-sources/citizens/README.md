# citizens

## Datasets

- `citizen-count-peer-week.csv`

    Contains the total number of Nation3 Citizens week by week, and the total number of [_active_](https://github.com/nation3/nationcred-datasets/tree/main/nationcred#definition-of-active) Citizens week by week.
    
- `citizens.csv`

    Contains the NFT Passport ID, Ethereum address and ENS name (if any) of each Nation3 Citizen.

## Install

```
npm install
```

## Build & Run

### Generate Citizen Count CSV

```
npx tsc generate-citizen-count-csv.ts
node generate-citizen-count-csv.js
```

### Generate Citizen Data CSV

```
npx tsc generate-citizens-csv.ts
node generate-citizens-csv.js
```
