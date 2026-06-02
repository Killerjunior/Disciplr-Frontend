import { loadTokens } from '../utils/token-loader';

describe('spacing token container ramp', () => {
  it('loads container size tokens from spacing.json', () => {
    const tokens = loadTokens('spacing.json');

    expect(tokens).toHaveProperty('spacing.container');
    expect(tokens.spacing?.container).toMatchObject({
      narrow: { $value: '640px' },
      standard: { $value: '960px' },
      wide: { $value: '1100px' },
      max: { $value: '1280px' },
    });
  });
});
