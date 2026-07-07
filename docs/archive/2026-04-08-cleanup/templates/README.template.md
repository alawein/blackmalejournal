# {{SERVICE_OR_REPO_NAME}}

{{One-line description of what this repository contains and who it serves.}}

**Status:** `production` | `development` | `prototype` | `deprecated`  
**Service tier:** `0` (critical) | `1` | `2` | `3` (low) — *TODO: set*  
**Owning team:** {{TEAM_NAME}} — {{SLACK_OR_TEAMS_CHANNEL}}  
**On-call / escalation:** {{PAGERDUTY_SCHEDULE_OR_LINK}} — secondary: {{NAME_OR_ROTATION}}

## Quickstart

Prerequisites: {{e.g. Node 22+, Docker, etc.}}

```bash
git clone {{REPO_URL}}
cd {{REPO_DIRECTORY}}
cp .env.example .env   # fill in values locally; never commit .env
{{INSTALL_COMMAND}}
{{RUN_DEV_COMMAND}}
```

Run tests:

```bash
{{TEST_COMMAND}}
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/README.md](./docs/README.md) | Documentation index |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |
| [docs/setup.md](./docs/setup.md) | Detailed local setup *(add if non-trivial)* |
| [docs/deploy.md](./docs/deploy.md) | Deploy / release *(services)* |
| [docs/architecture.md](./docs/architecture.md) | System context *(recommended)* |

## Operations

- **Dashboards:** {{GRAFANA_OR_EQUIVALENT_LINK}}
- **Logs / traces:** {{OBSERVABILITY_LINK}}
- **Runbooks:** [docs/runbooks/](./docs/runbooks/)

## Security

Please report vulnerabilities per [SECURITY.md](./SECURITY.md). Do not open public issues for security bugs.

## License

{{SPDX_ID}} — see [LICENSE](./LICENSE) or [org license policy]({{INTERNAL_LICENSE_URL}}).
