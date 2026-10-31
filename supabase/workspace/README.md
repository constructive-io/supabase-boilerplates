# ____repoName____

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/____username____/____repoName____/actions/workflows/ci.yml">
    <img height="20" src="https://github.com/____username____/____repoName____/actions/workflows/ci.yml/badge.svg" />
  </a>
</p>


## Getting Started

This workspace was generated with `pgpm init workspace` from
[supabase-boilerplates](https://github.com/constructive-io/supabase-boilerplates). It tests
and audits against the **local Supabase stack** (`supabase start`), so `auth.uid()`, the
`anon` / `authenticated` / `service_role` roles and the `auth` schema behave as they do in
your hosted project. For the full guide, see
[Supabase testing](https://constructive.io/learn/supabase).

### Quick Start

```sh
# Install dependencies
pnpm install

# Start the local Supabase stack (requires Docker) and point pgpm at its database
npx supabase init
npx supabase start
export PGHOST=127.0.0.1 PGPORT=54322 PGUSER=supabase_admin PGPASSWORD=postgres

# Create a module, then give it the Supabase schemas (auth, storage, roles)
pgpm init
cd packages/your-module
pgpm install @pgpm/supabase

# Run tests
pnpm test:watch

# From the workspace root: audit every module's schema (see safegres.config.js)
pnpm run audit:db
```

`pgpm.json` maps pgpm's role names onto Supabase's (`anonymous` → `anon`,
`administrator` → `service_role`), so `db.setContext({ role: 'authenticated' })` in a
`supabase-test` test runs exactly as a signed-in Supabase request would.

### Bring an existing Supabase project

`supabase db dump` writes your project's schema without Supabase's own managed schemas;
`pgpm import` turns that dump into a module with one deploy/revert/verify change per object
(tables, indexes, RLS, policies, grants), ready to test and audit here:

```sh
# From your existing Supabase project (use --db-url for a hosted database)
npx supabase db dump --local -f schema.sql

# In this workspace
pgpm import schema.sql --pkg my-app --out packages
cd packages/my-app
pgpm install @pgpm/supabase   # adds the auth schema your policies reference
pgpm deploy --database my_app_check --createdb --yes
```

`pgpm import` reports what it could not place: statements on objects the dump did not
create (e.g. `GRANT USAGE ON SCHEMA public`) land in `misc/statements`, and `ALTER ... OWNER`
has no derivable revert. Review those, then write `supabase-test` tests for your policies.
To restructure the result (one change per column, per alteration, or one linear file), see
`pgpm transform --help` and the `pgpm-projections` skill.

### Auditing

[safegres](https://www.npmjs.com/package/safegres) grades the schema this workspace
deploys on two independent axes — security (grants, RLS, policy coverage and behavior)
and performance (predicates no index can serve, per-row function calls, foreign keys
without a covering index). It runs from the workspace root and needs no configuration
per module: every module under `packages/` is deployed into one ephemeral database and
that catalog is scanned, so a module joins the audit the moment `pgpm init` creates it.

```sh
# Audit: deploys every module into an ephemeral database and scans its catalog
pnpm run audit:db

# Accept today's performance findings as debt, so CI gates only on new ones
pnpm run audit:db:baseline

# Audit a database you already have instead
pnpm exec safegres audit --database your_db
```

The gates and the exposed surface to grade against live in `safegres.config.js`;
the run also writes JSON, markdown and SARIF reports to `safegres-reports/`.
`safegres-perf-baseline.json` starts empty and is committed — it is the accepted
performance debt, and the only audit file that carries state. CI runs the same audit
as a single `Database audit (safegres)` job.

Declaring `exposure` in the config is the first thing worth doing: until the audit
knows which schemas and roles your API reaches it has to assume the whole database
is, and caps the score at the `B` the gate allows.

### Install scripts

`pnpm install` never asks you to approve build scripts here: every dependency that
wants to run code at install time already has a decision in `pnpm-policy.yaml`. If a
new dependency stops the install with `ERR_PNPM_IGNORED_BUILDS`, add it there — under
`allowBuilds` with a reason if it truly needs its script, or as `false` if it does not —
and run `pnpm run policy`. Don't use `pnpm approve-builds`; it writes outside the
managed block and `pnpm run policy:check` will fail.

### Working with an AI agent

`pgpm init workspace` installed the `pgpm` skill at `.agents/skills/pgpm/` — a guide to
pgpm's commands, the deploy/revert/verify pattern, plan files, dependencies, testing, and
CI. Agents that read `.agents/skills/` (Codex, Cursor, Gemini CLI, opencode, ...) pick it
up automatically; see [AGENTS.md](./AGENTS.md).

For an agent that looks elsewhere — Claude Code reads `.claude/skills/` — either point it
at `.agents/skills/pgpm/SKILL.md` directly, or install the skill into the location it
expects:

```sh
npx skills add https://github.com/constructive-io/constructive --skill pgpm
```

### Prerequisites

- Node.js 22+
- pnpm
- Docker (for the local Supabase stack)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (or `npx supabase`)
- PostgreSQL client tools (`psql`)
- pgpm (`npm install -g pgpm`)

See [Prerequisites](https://constructive.io/learn/quickstart/prerequisites) for detailed setup instructions.

## Credits

**🛠 Built by the [Constructive](https://constructive.io) team — creators of modular Postgres tooling for secure, composable backends. If you like our work, contribute on [GitHub](https://github.com/constructive-io).**

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
