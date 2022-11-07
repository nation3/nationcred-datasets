# NationCred Datasets

Current and historical NationCred scores

## Data Sources

A Nation3 citizen's NationCred score is based on multiple data sources:

```mermaid
graph TD
    subgraph Nation3 Governance
    Discord_Karma(Discord)-->Karma
    Discourse_Karma(Discourse)-->Karma
    Snapshot-->Karma
    end
    Karma-->NationCred
    
    subgraph Nation3 Operations
    Aragon(Aragon DAO)
    Gnosis(Gnosis Multisig)
    Coordinape(Coordinape CoVault)
    end
    Aragon-->NationCred
    Gnosis-->NationCred
    Coordinape-->NationCred
    
    subgraph Nation3 Value Creation
    GitHub-->SourceCred
    Discord-->SourceCred
    Discourse-->SourceCred
    Dework
    end
    Dework-->NationCred
    SourceCred-->NationCred
    
    subgraph Nation3 Activity
    NationCred
    end
```
