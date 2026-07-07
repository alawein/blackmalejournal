const nextJest = require('next/jest.js');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  collectCoverageFrom: [
    'src/lib/stripe/**/*.ts',
    'src/lib/supabase/queries.ts',
    'src/app/api/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    // stripe/helpers.ts is the exercised file — config.ts has 62% actual, floor is 50
    './src/lib/stripe/helpers.ts': { lines: 67 },
    // queries.ts — well-tested; floor is actual (82%) minus 10pp, capped at 70
    './src/lib/supabase/queries.ts': { lines: 70 },
    // API routes that have active test coverage; 0%-covered routes excluded from threshold
    './src/app/api/contact/route.ts': { lines: 86 },
    './src/app/api/newsletter/subscribe/route.ts': { lines: 86 },
    './src/app/api/search/route.ts': { lines: 86 },
    './src/app/api/stripe/checkout/route.ts': { lines: 90 },
    './src/app/api/stripe/donate/route.ts': { lines: 86 },
    './src/app/api/stripe/manage-billing/route.ts': { lines: 90 },
    './src/app/api/stripe/webhook/route.ts': { lines: 86 },
  },
};

module.exports = createJestConfig(config);
