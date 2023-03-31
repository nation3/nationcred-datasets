# NationCred

Each Nation3 Citizen has a NationCred score, which is used to measure how _active_ the Citizen is.

## Definition of _Active_

We define an _active_ Citizen as someone who dedicates [at least 1 hour per week](https://forum.nation3.org/t/proposal-set-q4-2022-goals/747) to Nation3.

## Datasets

- `output/nationcred-<passportId>.csv`

  A Nation3 Citizen's NationCred score week by week.

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

hF4DDlIzcyJuRJUSAQdAqJY6066Rq3uPF7+AqEReNnpUq6xAmuHv2O6fp6X7WwYw
UZQ4mZ65DPbNcpQZJqIG2mZ0ehzULxLmU3fBsAOefKzIKnXw/lD/n6FjFPD0Levj
hQIMA71liA8TkGadAQ/7BDNUSqAFf6vDrAzjYjef+g1PX7k0tqIBB8n4eWE3t0Rz
XlIHxJQI061id1AdYTU8qa1kLx0faSBBiCXiI+AHkG3RcrgiaqdkykXAdBM45ydA
KuRt/4GuXIuf54tb94JL3mCJ/dYJYG8aZFLDuugVJCdQoKnGh0j8MtpWFnpKSmjW
Jj3XndlkbtfqF5Wea7BA5VP0GXwoln9dHWeyR48XoxM6VkBZH7q3D0PnDy/nOx+r
FH+UwbPKftLEsYojWyCmxqF5eYy2MZACnaT4JnxWM0yDzO/UUIZgKSOSaAHhUH7l
hlQqXB+tpYmIhzyAUgUCK04qDgU9Fs5JcfftV55/fn4oIby4OsITweNboXU9L0qv
F2Z1cFw5nS8mhSBrXK1hPLD2ct7EVVW2MYPtzbIGwQd87bk2LbfKOIK6eU+zp7Ry
WUvzlv/SGSC0jNfUFCoSdPDEnm1KALoTk/WC0pfwQi846prxnczS12iMRCzO+Biz
Zjm3Gp3e2ko0pmAlMj8NlEpaIusvgKbJW5IE8zQ51cPnC1LC8d5S6cQ/E+51IPmv
jpT+ELvqMFqoo7PuGha/CF2qnDhN1lQwciWbMkHHL1pnNvMFpePwSrA9KX6Pvzk2
jPxBTPv5Mt+ZHxBbPoeieyxKERESE6s/5jF6KYMAMAmGE1VPkujElDLdp8aAAqCE
XgNly3A8RJheFRIBB0CfzSrISkag6ddnW7+fvGnKaku78+SmOJ6oI+7z/1n4GjB6
1DoMZHA5/cnexBi4dxwCPvqx9o+1BuHZLA4+eKBFsNb7TXLkWCcmi6Qnc9uIo/HS
cwGTK2K3ake1/xSryFi/oLLQXwp3KNacvD2UsfKH4lqQQ+hhC8XxcbPM/9kNc162
3/LrMeohbb10OZAtf8IxOQ/BeDhJZgpKn/CyfDtgO/sNM9g9s882WHh9sgSLmaRn
qDjJYAw9k5/c3lSDuUqy//J7rCM=
=JvK6
-----END PGP MESSAGE-----
```

PGP recipients: @johnmark13, @luisivan, @aahna-ashina

### Update Smart Contract

Update the smart contract (using the passport IDs in `output/nationcred-active-citizens.csv`):

```
npm run update-smart-contract
```
