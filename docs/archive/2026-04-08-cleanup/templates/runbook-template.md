# Runbook: {{SERVICE_NAME}} — {{PRIMARY_SCENARIO_OR_AREA}}

**Service tier:** {{0–3}}  
**Owning team:** {{TEAM}} — {{SLACK}}  
**Last reviewed:** {{YYYY-MM-DD}}  
**Dashboards:** {{LINKS}}  
**Logs / traces:** {{LINKS}}

## Scope

What this runbook covers—and what it does **not** (point to other runbooks).

## Symptoms

- User-visible: <!-- e.g. elevated 5xx, failed checkout -->
- Alerts: <!-- pager, monitor names -->

## Impact

- **Severity guide:** When to page vs next-business-day

## Diagnostics

1. **Confirm the issue** — links to queries / panels (paste example filters).
2. **Check recent deploys** — link to deploy pipeline / changelog.
3. **Check dependencies** — status page links for upstreams.

```text
# Example query or CLI (sanitize secrets)

```

## Mitigation

### Immediate (stop the bleeding)

1.
2.

### Short-term fix

1.
2.

## Rollback

- **Safe to revert last deploy?** Yes / No — conditions:
- **Steps:**

```bash
# commands
```

## Escalation

| Condition | Action |
|-----------|--------|
| Data corruption suspected | Page {{ROLE}}; open incident |
| Beyond {{TIME}} without mitigation | Eng leadership + {{COMMS_OWNER}} |

## Post-incident

- [ ] Update this runbook if steps changed
- [ ] Link postmortem within 5 business days (policy)

## Related links

- Architecture: [docs/architecture.md](../architecture.md)
- ADRs: [docs/adr/](../adr/)
