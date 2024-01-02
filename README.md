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
    end
    SourceCred-->NationCred
    Dework-->NationCred
    
    subgraph Nation3 Governance
        Discord_Karma(Discord)-->Karma
        Discourse_Karma(Discourse)-->Karma
        Snapshot-->Karma
    end
    Karma-->NationCred
    
    subgraph Nation3 Operations
        Aragon(Aragon OSx DAO Agents)
        Safe(Safe Multisig)
        Coordinape(Coordinape CoVaults)
    end
    Aragon-->NationCred
    Safe-->NationCred
    Coordinape-->NationCred
    
    subgraph Nation3 Activity
        NationCred
    end
```

```mermaid
graph TD
    subgraph coordinape [Coordinape Contributions]
        coordinape_dev(Development Guild)
        coordinape_marketing(Marketing Guild)
        coordinape_ops(Operations Guild)
        coordinape_ecoride(EcoRide Network)
    end
    coordinape_dev-->NationCred
    coordinape_marketing-->NationCred
    coordinape_ops-->NationCred
    coordinape_ecoride-->NationCred
    
    subgraph Nation3 Activity
        NationCred
    end
```

See [`data-sources/`](data-sources/)

## NationCred

See [`nationcred/`](nationcred/)


## Weekly Cron Job

[![Generate Datasets (Weekly Cron Job)](https://github.com/nation3/nationcred-datasets/actions/workflows/generate-datasets-weekly.yml/badge.svg)](https://github.com/nation3/nationcred-datasets/actions/workflows/generate-datasets-weekly.yml)
