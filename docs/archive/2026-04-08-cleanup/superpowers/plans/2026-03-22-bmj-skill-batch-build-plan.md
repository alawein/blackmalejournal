# BMJ Skill Batch Build Plan

This plan turns the BMJ skill roadmap into an efficient build sequence that maximizes parallel work while keeping write scopes separate and reviewable.

## Default Assumptions

- Skill destination: `C:\Users\mesha\.codex\skills`
- Skill initializer: `C:\Users\mesha\.codex\skills\.system\skill-creator\scripts\init_skill.py`
- Skill validator: `C:\Users\mesha\.codex\skills\.system\skill-creator\scripts\quick_validate.py`
- BMJ source of truth remains in this repository under `docs/` and `src/`

If the final skill location changes, keep the batch order the same and only swap the destination path.

## Efficiency Rule

Separate the work into three phases:

1. Parallel scaffold creation
2. Parallel content authoring in disjoint batches
3. Central validation and alignment pass

Do not mix all three in one step. Scaffolding is cheap and parallel. Authoring is parallel only when the source surfaces do not overlap too heavily. Alignment and validation should be centralized.

## Skill Set

Target skills:

1. `bmj-brand-guardian`
2. `bmj-membership-and-paywall`
3. `bmj-admin-cms-operator`
4. `bmj-session-closeout`
5. `bmj-editorial-surface`
6. `bmj-audience-ops`
7. `bmj-release-operator`

## Parallelization Model

### Batch 0: Source Mapping

Goal:
- Freeze the source surfaces and file ownership before creating skill content.

Single owner tasks:
- Confirm the source-of-truth docs and code areas for each skill
- Confirm naming, descriptions, and default prompts
- Confirm which skills need `scripts/`, `references/`, and `assets/`

Output:
- Final metadata table for all skills
- Final write scopes for each skill

This batch is short and should stay centralized to avoid duplicated planning.

### Batch 1: Parallel Scaffold Pass

Goal:
- Create all seven skill directories in parallel with placeholder `SKILL.md`, `agents/openai.yaml`, and resource folders.

Why this can run in parallel:
- Each skill writes to its own folder under `C:\Users\mesha\.codex\skills\<skill-name>`
- No shared output files are modified

Recommended grouping:
- Group A: `bmj-brand-guardian`, `bmj-membership-and-paywall`, `bmj-admin-cms-operator`, `bmj-session-closeout`
- Group B: `bmj-editorial-surface`, `bmj-audience-ops`, `bmj-release-operator`

You can run all seven at once, but splitting into two groups keeps console output easier to review.

#### Scaffold Metadata Matrix

Use these values at scaffold time.

| Skill | Short description | Default prompt |
|---|---|---|
| `bmj-brand-guardian` | BMJ brand fidelity guardrails | `Use $bmj-brand-guardian to enforce BMJ visual invariants on a public UI change.` |
| `bmj-membership-and-paywall` | BMJ membership and access flows | `Use $bmj-membership-and-paywall to update pricing, portal, Stripe, or paywall behavior.` |
| `bmj-admin-cms-operator` | BMJ admin and publishing ops | `Use $bmj-admin-cms-operator to change BMJ admin CMS workflows or back-office tooling.` |
| `bmj-session-closeout` | BMJ docs and audit closeout | `Use $bmj-session-closeout to wrap a BMJ work session and update the required docs artifacts.` |
| `bmj-editorial-surface` | BMJ public editorial surfaces | `Use $bmj-editorial-surface to refine BMJ public content pages, cards, taxonomy, or search surfaces.` |
| `bmj-audience-ops` | BMJ audience and supporter ops | `Use $bmj-audience-ops to improve BMJ contact, newsletter, donation, or supporter workflows.` |
| `bmj-release-operator` | BMJ release and deploy workflow | `Use $bmj-release-operator to run the BMJ release flow from verification through deployment checks.` |

#### Resource Matrix

| Skill | Resources |
|---|---|
| `bmj-brand-guardian` | `references` |
| `bmj-membership-and-paywall` | `scripts,references` |
| `bmj-admin-cms-operator` | `scripts,references` |
| `bmj-session-closeout` | `references` |
| `bmj-editorial-surface` | `references` |
| `bmj-audience-ops` | `references` |
| `bmj-release-operator` | `scripts,references` |

#### Example Parallel Scaffold Commands

Run these from PowerShell if you want to scaffold the skills quickly. Review the destination path first.

```powershell
$init = "C:\Users\mesha\.codex\skills\.system\skill-creator\scripts\init_skill.py"
$dest = "C:\Users\mesha\.codex\skills"

$jobs = @(
  "python `"$init`" bmj-brand-guardian --path `"$dest`" --resources references --interface short_description=`"BMJ brand fidelity guardrails`" --interface default_prompt=`"Use `$bmj-brand-guardian to enforce BMJ visual invariants on a public UI change.`"",
  "python `"$init`" bmj-membership-and-paywall --path `"$dest`" --resources scripts,references --interface short_description=`"BMJ membership and access flows`" --interface default_prompt=`"Use `$bmj-membership-and-paywall to update pricing, portal, Stripe, or paywall behavior.`"",
  "python `"$init`" bmj-admin-cms-operator --path `"$dest`" --resources scripts,references --interface short_description=`"BMJ admin and publishing ops`" --interface default_prompt=`"Use `$bmj-admin-cms-operator to change BMJ admin CMS workflows or back-office tooling.`"",
  "python `"$init`" bmj-session-closeout --path `"$dest`" --resources references --interface short_description=`"BMJ docs and audit closeout`" --interface default_prompt=`"Use `$bmj-session-closeout to wrap a BMJ work session and update the required docs artifacts.`"",
  "python `"$init`" bmj-editorial-surface --path `"$dest`" --resources references --interface short_description=`"BMJ public editorial surfaces`" --interface default_prompt=`"Use `$bmj-editorial-surface to refine BMJ public content pages, cards, taxonomy, or search surfaces.`"",
  "python `"$init`" bmj-audience-ops --path `"$dest`" --resources references --interface short_description=`"BMJ audience and supporter ops`" --interface default_prompt=`"Use `$bmj-audience-ops to improve BMJ contact, newsletter, donation, or supporter workflows.`"",
  "python `"$init`" bmj-release-operator --path `"$dest`" --resources scripts,references --interface short_description=`"BMJ release and deploy workflow`" --interface default_prompt=`"Use `$bmj-release-operator to run the BMJ release flow from verification through deployment checks.`""
)

$jobs | ForEach-Object -Parallel { Invoke-Expression $_ } -ThrottleLimit 4
```

### Batch 2: Parallel Authoring Wave 1

Goal:
- Fill in the four highest-value skills first.

Skills:

1. `bmj-brand-guardian`
2. `bmj-membership-and-paywall`
3. `bmj-admin-cms-operator`
4. `bmj-session-closeout`

Why these belong together:
- They unlock the highest-value BMJ work immediately
- Their primary source areas are mostly distinct
- They can be owned independently with low merge risk

Recommended ownership:

- Worker 1: `bmj-brand-guardian`
  Source focus: `docs/brand/`, `src/styles/`, `src/components/brand/`, `src/components/ui/`
- Worker 2: `bmj-membership-and-paywall`
  Source focus: membership docs, `src/app/api/stripe/`, portal, pricing, paywall, access layer
- Worker 3: `bmj-admin-cms-operator`
  Source focus: `src/app/(auth)/admin/`, admin queries, upload flow, publishing SOP
- Worker 4: `bmj-session-closeout`
  Source focus: docs closeout rules, audits lane, indexes, migration changelog

Validation gate after Batch 2:
- Run `quick_validate.py` for all four skills
- Check for repeated or conflicting terminology across `membership`, `admin`, and `closeout`
- Verify the SKILL descriptions trigger on BMJ-specific language, not only generic wording

### Batch 3: Parallel Authoring Wave 2

Goal:
- Build the next three skills after the highest-risk surfaces are covered.

Skills:

1. `bmj-editorial-surface`
2. `bmj-audience-ops`
3. `bmj-release-operator`

Why these wait for Wave 1:
- Editorial and audience skills benefit from the brand and closeout patterns already being defined
- Release skill should reflect the terminology and outputs of the earlier skills

Recommended ownership:

- Worker 1: `bmj-editorial-surface`
  Source focus: public content routes, editorial listing/detail components, search, taxonomy
- Worker 2: `bmj-audience-ops`
  Source focus: contact, support, donations, newsletter, messages, subscribers
- Worker 3: `bmj-release-operator`
  Source focus: `docs/ops/`, `.github/workflows/ci.yml`, `.vercel/`, env and deploy assumptions

Validation gate after Batch 3:
- Run `quick_validate.py` for all three skills
- Verify the release skill references the outputs and docs responsibilities of the other six
- Verify editorial and audience skills do not overlap in trigger descriptions too broadly

### Batch 4: Central Alignment Pass

Goal:
- Normalize the whole skill pack so it behaves like one BMJ operating system.

Single owner tasks:
- Normalize naming and phrasing across all seven `SKILL.md` files
- Regenerate or verify `agents/openai.yaml` consistency if needed
- Remove duplicate references that should instead live in one skill only
- Ensure every skill uses imperative instructions and progressive disclosure

Cross-skill checks:

- `bmj-brand-guardian` and `bmj-editorial-surface` should not fight over the same decision boundary
- `bmj-membership-and-paywall` and `bmj-audience-ops` should be separated cleanly: paid access versus supporter/contact/comms
- `bmj-admin-cms-operator` should own internal admin procedures, not public rendering behavior
- `bmj-session-closeout` should reference the docs consequences of all other skills, not re-explain their domain workflows
- `bmj-release-operator` should orchestrate release, not absorb brand, billing, or CMS details that belong elsewhere

## Fastest Efficient Path

If speed matters more than perfection, use this order:

1. Scaffold all seven skills in parallel
2. Author Wave 1 in parallel
3. Validate Wave 1
4. Author Wave 2 in parallel
5. Validate Wave 2
6. Run one central alignment pass

This is the highest-throughput path with manageable coordination cost.

## Highest-Integrity Path

If quality matters more than speed, use this order:

1. Scaffold all seven skills in parallel
2. Author `bmj-brand-guardian` and `bmj-session-closeout` first
3. Use their patterns to author the other five in two waves
4. Validate every wave before starting the next
5. Run a final alignment pass

This is slower, but it reduces drift in tone and structure.

## Suggested First Execution Round

For this repo, use a hybrid approach:

1. Parallel scaffold all seven skills
2. Parallel author:
   - `bmj-brand-guardian`
   - `bmj-membership-and-paywall`
   - `bmj-admin-cms-operator`
3. Author `bmj-session-closeout` immediately after those three, using the real docs update patterns that emerge
4. Parallel author:
   - `bmj-editorial-surface`
   - `bmj-audience-ops`
   - `bmj-release-operator`
5. Run one central alignment and validation pass

Reason:
- It preserves most of the speed of full parallel work
- It avoids writing the closeout skill before the real recurring cleanup patterns are clear

## Definition Of Done

The BMJ skill pack is ready when:

- All seven skill folders exist under the target skill directory
- Every skill passes `quick_validate.py`
- Every skill has a specific BMJ trigger description, not generic task wording
- Reference files are concise and tied to real BMJ docs or code surfaces
- The skill boundaries are clean enough that a user request maps to one primary BMJ skill most of the time
- The release and closeout skills explicitly point back to the BMJ docs system
