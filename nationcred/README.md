# NationCred

Each Nation3 Citizen has a NationCred score, which is used to measure how _active_ the Citizen is.

## Definition of _Active_

We define an _active_ Citizen as someone who dedicates [at least 1 hour per week](https://forum.nation3.org/t/proposal-set-q4-2022-goals/747) to Nation3.

## Datasets

- `nationcred-<passportId>.csv`

  A Nation3 Citizen's NationCred score week by week.

- `nationcred-active-citizens.csv`

  Contains a list of Ethereum addresses belonging to _active_ Nation3 Citizens, week by week.

## Build Instructions

```
npm install
npm run lint
npm run build
npm run generate
```
