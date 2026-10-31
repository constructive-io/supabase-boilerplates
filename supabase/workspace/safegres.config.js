/**
 * Database audit — https://www.npmjs.com/package/safegres
 *
 * safegres reads the catalog of a live database and scores it on two
 * independent axes: security (grants, RLS, policy coverage, policy behavior)
 * and performance (policy predicates no index can serve, per-row function
 * calls, foreign keys without a covering index). Nothing is executed against
 * your data and nothing is written.
 *
 *   pnpm run audit:db            # audit + gates
 *   pnpm run audit:db:baseline   # accept today's perf findings as debt
 *
 * `source.pgpm` deploys every module under `packages/` into one ephemeral
 * database on the local Supabase stack (the PG* variables in the README), so
 * Supabase's roles and `auth` schema are there, and audits that. A new module
 * joins the audit the moment `pgpm init` creates it.
 */
module.exports = {
  // Supabase's API roles: `anon` is the unauthenticated caller; `anon` and
  // `authenticated` are both reachable through PostgREST.
  extends: 'safegres:supabase',

  source: { pgpm: '.' },

  // The pgpm ledger is the package manager's own bookkeeping, and `auth`,
  // `storage` and `supabase_functions` are Supabase's own (from @pgpm/supabase):
  // not your code, so their findings are not yours to fix.
  excludeSchemas: ['pgpm_migrate', 'auth', 'storage', 'supabase_functions'],

  // The schemas PostgREST serves: `[api] schemas` in supabase/config.toml, or
  // API settings → Exposed schemas on a hosted project. A schema missing here
  // is reported as internal, not scored — list every schema your app exposes.
  exposure: { schemas: ['public'] },

  // Signed-in users writing their own rows is the product; only a write grant
  // or write policy reachable by an unauthenticated (anon) caller is a finding.
  rules: {
    R1: ['critical', { rolesFrom: 'anon' }],
    R2: ['critical', { rolesFrom: 'anon' }]
  },

  // Security is gated on a grade; performance is gated on a ratchet: commit
  // today's findings as accepted debt and fail only on new ones.
  perf: {
    enabled: true,
    baseline: 'safegres-perf-baseline.json',
    failOnNew: true
  },

  // safegres.json / safegres.md / safegres.sarif — git-ignored, re-derived.
  outputs: { dir: 'safegres-reports' },

  failOn: { grade: 'B' }
};
