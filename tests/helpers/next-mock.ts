export function createMockRequest(body: unknown, options: { method?: string; headers?: Record<string, string> } = {}): Request {
  const { method = 'POST', headers = {} } = options;
  return new Request('http://localhost:3000/api/test', {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

export function createMockTextRequest(text: string, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/test', {
    method: 'POST',
    headers,
    body: text,
  });
}

// Mock for next/navigation redirect — throws like the real one
export class RedirectError extends Error {
  public readonly digest: string;
  constructor(public readonly url: string) {
    super(`NEXT_REDIRECT:${url}`);
    this.digest = `NEXT_REDIRECT;replace;${url};303`;
  }
}

// Navigation mock fns — import and use with jest.mock at module level in tests
export const mockPush = jest.fn();
export const mockReplace = jest.fn();
export const mockRefresh = jest.fn();
export const mockBack = jest.fn();
