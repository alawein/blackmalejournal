type SupabaseResult = { data: unknown; error: null } | { data: null; error: { message: string } };

function createChainableMock(resolvedValue: SupabaseResult = { data: [], error: null }) {
  const chain: Record<string, jest.Mock> = {};

  const methods = [
    'select',
    'insert',
    'update',
    'upsert',
    'delete',
    'eq',
    'neq',
    'contains',
    'order',
    'limit',
    'range',
    'single',
    'maybeSingle',
    'in',
    'lte',
    'gte',
    'ilike',
    'or',
    'is',
    'not',
  ];

  for (const method of methods) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }

  // Terminal methods resolve to the value
  chain.single = jest.fn().mockResolvedValue(resolvedValue);
  chain.maybeSingle = jest.fn().mockResolvedValue(resolvedValue);

  // Make the chain itself thenable (for queries without .single())
  chain.then = jest.fn((resolve) => resolve(resolvedValue));

  // Override to make non-terminal methods return the chain
  for (const method of methods.filter(m => m !== 'single' && m !== 'maybeSingle')) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }

  return chain;
}

export function createMockSupabaseClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  const result: SupabaseResult = overrides.error
    ? { data: null, error: overrides.error }
    : { data: overrides.data ?? [], error: null };

  const queryChain = createChainableMock(result);

  const client = {
    from: jest.fn().mockReturnValue(queryChain),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    _queryChain: queryChain, // exposed for test assertions
  };

  return client;
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

// ── Shared test helpers ─────────────────────────────────────────────────────

export type QueryResponse = {
  table: string;
  data?: unknown;
  error?: { message: string } | null;
  count?: number | null;
};

/**
 * Configure a mock client so that successive `.from()` calls return
 * different data/error/count values in order. Use when a function
 * calls `.from()` more than once (e.g. bulk operations).
 */
export function setFromSequence(mockClient: MockSupabaseClient, responses: QueryResponse[]) {
  let index = 0;
  mockClient.from = jest.fn().mockImplementation((table: string) => {
    const response = responses[index];
    if (!response) throw new Error(`No mocked response for table "${table}" at index ${index}`);
    index += 1;
    expect(table).toBe(response.table);
    const client = createMockSupabaseClient(
      response.error ? { error: response.error } : { data: response.data ?? [] },
    );
    const chain = client._queryChain;
    if (Object.prototype.hasOwnProperty.call(response, 'count')) {
      chain.then = jest.fn((resolve) =>
        resolve({
          data: response.error ? null : (response.data ?? null),
          error: response.error ?? null,
          count: response.count ?? null,
        }),
      );
    }
    return chain;
  });
}

/**
 * Configure a mock client so `.from(tableName)` returns the data/error/count
 * defined for that table name. Useful when a function fans out across tables.
 */
export function setFromByTable(
  mockClient: MockSupabaseClient,
  responses: Record<string, Omit<QueryResponse, 'table'>>,
) {
  mockClient.from = jest.fn().mockImplementation((table: string) => {
    const response = responses[table] ?? {};
    const client = createMockSupabaseClient(
      response.error ? { error: response.error } : { data: response.data ?? [] },
    );
    const chain = client._queryChain;
    chain.then = jest.fn((resolve) =>
      resolve({
        data: response.error ? null : (response.data ?? []),
        error: response.error ?? null,
        count: response.count ?? null,
      }),
    );
    return chain;
  });
}

/**
 * Reset the client and pre-configure `.single()` to resolve with data.
 */
export function setSingleData(mockClient: MockSupabaseClient, data: unknown) {
  const fresh = createMockSupabaseClient({ data });
  Object.assign(mockClient, fresh);
  mockClient._queryChain.single.mockResolvedValue({ data, error: null });
}

/**
 * Reset the client and pre-configure `.single()` to resolve with an error.
 */
export function setSingleError(mockClient: MockSupabaseClient, message = 'single failed') {
  const fresh = createMockSupabaseClient();
  Object.assign(mockClient, fresh);
  mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message } });
}
