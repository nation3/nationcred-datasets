# NationCred Datasets

Current and historical NationCred scores

## Data Sources

A Nation3 citizen's NationCred score is based on multiple data sources:

```mermaid
graph TD
    subgraph Nation3 Value Creation
        GitHub-->SourceCred
        Discord-->SourceCred
        Discourse-->SourceCred
        Dework
        Marketing_Guild(Marketing Guild)
    end
    SourceCred-->NationCred
    Dework-->NationCred
    Marketing_Guild-->NationCred
    
    subgraph Nation3 Governance
        Discord_Karma(Discord)-->Karma
        Discourse_Karma(Discourse)-->Karma
        Snapshot-->Karma
    end
    Karma-->NationCred
    
    subgraph Nation3 Operations
        Aragon(Aragon OSx DAO Agents)
        Safe(Safe Multisig)
        Ops_Guild(Ops Guild)
    end
    Aragon-->NationCred
    Safe-->NationCred
    Ops_Guild-->NationCred
    
    subgraph Nation3 Activity
        NationCred
    end
```

See [`data-sources/`](data-sources/)

## NationCred

See [`nationcred/`](nationcred/)


## Weekly Cron Job

[![Generate Datasets (Weekly Cron Job)](https://github.com/nation3/nationcred-datasets/actions/workflows/generate-datasets-weekly.yml/badge.svg)](https://github.com/nation3/nationcred-datasets/actions/workflows/generate-datasets-weekly.yml)
