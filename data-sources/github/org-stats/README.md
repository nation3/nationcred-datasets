# org-stats

Organization-wide GitHub statistics for Nation3.

https://github.com/caarlos0/org-stats

## Usage

Install:

```bash
brew install caarlos0/tap/org-stats
```

Generate a GitHub access token:

- Go to https://github.com/settings/tokens
- Click "Generate new token"
- Select the "repo" scope

Collect statistics for the past 7 days:

```bash
export GITHUB_TOKEN=<token>
export ORG_STATS_TIMESTAMP=$(TZ=UTC date +%F_%T)_UTC
org-stats --org nation3 --since 7d --top 100 --include-reviews --csv-path github-org-stats-7d_$ORG_STATS_TIMESTAMP.csv
```
