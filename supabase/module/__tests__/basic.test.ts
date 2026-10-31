import { getConnections, PgTestClient } from 'supabase-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  // A fresh database on the local Supabase stack with this module deployed.
  // `pg` is the superuser (bypasses RLS, use it to seed); `db` is the app
  // connection you switch roles on with db.setContext({ role: 'authenticated',
  // 'request.jwt.claim.sub': userId }). Seed auth.users with insertUser(pg, ...).
  ({ pg, db, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
  await pg.afterEach();
});

describe('supabase', () => {
  it('has the auth schema', async () => {
    const result = await pg.one(`SELECT to_regclass('auth.users') IS NOT NULL AS present`);
    expect(result.present).toBe(true);
  });

  it('runs as anon by default', async () => {
    db.setContext({ role: 'anon' });
    const result = await db.one('SELECT current_user AS role');
    expect(result.role).toBe('anon');
  });
});
