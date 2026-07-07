import '@testing-library/jest-dom';

// Mock next/cache (server-only — not available in jsdom)
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Suppress jsdom "not implemented: navigation" console.error messages
function isJsdomNavError(arg: unknown): boolean {
  if (typeof arg !== 'object' || arg === null) return false;
  return (arg as { type?: string }).type === 'not implemented';
}

const originalConsoleError = console.error;

beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (isJsdomNavError(args[0])) return;
    originalConsoleError(...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Mock next/link
jest.mock('next/link', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({
      href,
      children,
      ...props
    }: {
      href: string;
      children: React.ReactNode;
      [key: string]: unknown;
    }) => React.createElement('a', { href, ...props }, children),
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) =>
          React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
            const {
              initial: _i,
              animate: _a,
              exit: _e,
              transition: _t,
              whileHover: _wh,
              whileTap: _wt,
              variants: _v,
              ...rest
            } = props;
            return React.createElement(prop, { ...rest, ref });
          }),
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useReducedMotion: jest.fn(() => false),
    useInView: jest.fn(() => true),
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) =>
        function MockIcon(props: Record<string, unknown>) {
          return React.createElement('svg', { 'data-testid': `icon-${prop}`, ...props });
        },
    },
  );
});
