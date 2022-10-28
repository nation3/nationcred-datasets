# NationCred Datasets

Current and historical NationCred scores

A Nation3 citizen's NationCred score is based on multiple data sources:

```mermaid
graph TD;
    Dework-->Karma;
    Discord-->SourceCred;
    Discourse-->SourceCred;
    GitHub-->SourceCred;
    Karma-->NationCred;
    Snapshot-->Karma;
    SourceCred-->NationCred;
```
