# NationCred Datasets

Current and historical NationCred scores

A Nation3 citizen's NationCred score is based on multiple data sources:

```mermaid
graph TD;
    subgraph Governance
    Discourse_Karma(Discourse)-->Karma;
    end
    subgraph Value Creation
    Discord-->SourceCred;
    Discourse-->SourceCred;
    GitHub-->SourceCred;
    Dework;
    end
    Karma-->NationCred;
    subgraph Governance
    Snapshot-->Karma;
    end
    SourceCred-->NationCred;
    subgraph Nation3 Activity
    NationCred
    end
    Dework-->NationCred;
```
