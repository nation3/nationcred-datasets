# NationCred

Each Nation3 Citizen has a NationCred score, which is used to measure how _active_ the Citizen is.

## Definition of _Active_

We define an _active_ Citizen as someone who dedicates [at least 1 hour per week](https://forum.nation3.org/t/proposal-set-q4-2022-goals/747) to Nation3.

## Datasets

- `output/nationcred-<passportId>.csv`

  A Nation3 Citizen's NationCred score week by week.

- `output/nationcred-scores.csv`

  A list of last week's NationCred score and accumulated NationCred score of each citizen.

- `output/nationcred-active-citizens.csv`

  Contains a list of Ethereum addresses belonging to _active_ Nation3 Citizens, week by week.

## Build Instructions

```
npm install
npm run lint
npm run build
npm run generate
```

## Update NationCred Smart Contract

### Private Key

Set the private key of the smart contract owner account in `.env`:

```
cp .env.sample .env
```

```
-----BEGIN PGP MESSAGE-----

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
C1D0XqO2XMTFuslZD9pPsDBPaV/Y/PqGplt+
=tRri
-----END PGP MESSAGE-----
```

PGP recipients: @johnmark13, @aahna-ashina, @preciousalo, @okhaimie-dev, @pythonpete32

### Update Smart Contract

Update the smart contract (using the passport IDs in `output/nationcred-active-citizens.csv`):

```
npm run update-smart-contract
```
