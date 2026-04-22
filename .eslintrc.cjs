module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:boundaries/recommended'],
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'app',     pattern: 'app/**/*' },
      { type: 'module',  pattern: 'src/modules/*', mode: 'folder' },
      { type: 'server',  pattern: 'src/server/*' },
      { type: 'lib',     pattern: 'src/lib/*' },
      { type: 'ui',      pattern: 'src/ui/*' },
      { type: 'content', pattern: 'src/content/**/*' },
    ],
    'boundaries/ignore': ['**/*.test.ts', '**/*.test.tsx', 'tests/**/*'],
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app',     allow: ['module', 'ui', 'lib', 'content', 'server'] },
        { from: 'module',  allow: ['module', 'lib', 'ui', 'server', 'content'] },
        { from: 'server',  allow: ['lib'] },
        { from: 'ui',      allow: ['lib'] },
        { from: 'content', allow: ['lib'] },
        { from: 'lib',     allow: [] },
      ],
    }],
    'boundaries/entry-point': ['error', {
      default: 'disallow',
      rules: [
        { target: ['module'],  allow: 'index.(ts|tsx)' },
        { target: ['ui'],      allow: 'index.(ts|tsx)' },
        { target: ['content'], allow: 'index.(ts|tsx)' },
        { target: ['lib'],     allow: '*.tsx?' },
        { target: ['server'],  allow: '*.tsx?' },
      ],
    }],
  },
};
