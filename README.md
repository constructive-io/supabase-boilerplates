# supabase-boilerplates

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

Supabase boilerplate templates for [pgpm](https://www.npmjs.com/package/pgpm), the PostgreSQL Package Manager. These templates scaffold workspaces and modules that test against the **local Supabase stack** (`supabase start`) with [`supabase-test`](https://www.npmjs.com/package/supabase-test) and audit it with [safegres](https://www.npmjs.com/package/safegres).

This is the Supabase sibling of [`pgpm-boilerplates`](https://github.com/constructive-io/pgpm-boilerplates) and [`pglite-boilerplates`](https://github.com/constructive-io/pglite-boilerplates). For a complete example project, see [supabase-test-suite](https://github.com/constructive-io/supabase-test-suite).

## Usage

```bash
# Create a new Supabase workspace
pgpm init workspace --repo https://github.com/constructive-io/supabase-boilerplates.git

# Create a new module (inside the workspace; it inherits this template repo)
pgpm init
cd packages/your-module
pgpm install @pgpm/supabase
```

The templates are fetched from this repository and cached locally under `~/.pgpm/cache/repos`. Use `pgpm cache clean` to clear the cache if you need a fresh pull.

## Structure

```
supabase/
├── module/      # Single pgpm module template (supabase-test)
└── workspace/   # Monorepo workspace template (Supabase CLI stack in CI, safegres)
```

## What's baked in

- **`supabase-test`** in every module, with `getConnections()` lifecycle hooks and an `anon` role-context example.
- **Supabase role mapping** in `pgpm.json`: `anonymous` → `anon`, `authenticated` → `authenticated`, `administrator` → `service_role`.
- **CI on the real stack**: the workflow starts the Supabase CLI local stack and runs every module's tests against it.
- **safegres**: `safegres.config.js` extends `safegres:supabase`, declares `public` as the exposed schema and fails below grade `B`. CI runs it on pull requests and on pushes to `main` (the baseline each PR is compared against).
- **Existing projects**: the workspace README shows how to turn `supabase db dump` output into a pgpm module with `pgpm import`.

## Placeholders

Templates use the `____placeholder____` pattern (4 underscores on each side) for variable substitution. These are replaced by [genomic](https://www.npmjs.com/package/genomic) during project generation.

## Scripts

```bash
# Install dependencies
pnpm install

# Scan templates for placeholder variables
pnpm run find-placeholders

# Interactively update template dependency versions
pnpm run update-deps
```

`.github/workflows/scaffold.yml` scaffolds a workspace and module from this repository daily and on every change, installs them, and runs the tests and the audit against `supabase start`.

## Credits

**🛠 Built by the [Constructive](https://constructive.io) team — creators of modular Postgres tooling for secure, composable backends. If you like our work, contribute on [GitHub](https://github.com/constructive-io).**
