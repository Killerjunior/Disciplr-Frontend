import { loadTokens } from '../utils/token-loader';

describe('loadTokens – path traversal prevention', () => {
  const traversalCases = [
    '../etc/passwd',
    '../../etc/shadow',
    '/etc/passwd',
    'tokens/../../etc/passwd',
    '..\\windows\\system32\\config\\sam',
    'colors.json/../../etc/passwd',
  ];

  test.each(traversalCases)('throws for "%s"', (input) => {
    expect(() => loadTokens(input)).toThrow();
  });

  test('throws for names with path separators', () => {
    expect(() => loadTokens('sub/colors.json')).toThrow();
  });

  test('throws for names without .json extension', () => {
    expect(() => loadTokens('colors')).toThrow();
  });

  test('accepts valid token file names', () => {
    // loadTokens will throw an fs error (file not found in test env), but NOT
    // our validation error – confirming the name itself passes the guard.
    const validNames = ['colors.json', 'typography.json', 'spacing.json'];
    validNames.forEach((name) => {
      expect(() => loadTokens(name)).not.toThrow(
        expect.objectContaining({ message: expect.stringMatching(/Invalid token file|Path traversal/) })
      );
    });
  });
});
