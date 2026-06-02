import { describe, expect, it } from 'vitest'
import { buildAnalyticsSeriesColors } from '../analyticsTheme'

const tokenFixture = {
  accent: 'accent-token',
  success: 'success-token',
  danger: 'danger-token',
  info: 'info-token',
  warning: 'warning-token',
  text: 'text-token',
  muted: 'muted-token',
  surface: 'surface-token',
  surfaceRaised: 'surface-raised-token',
  border: 'border-token',
  bg: 'bg-token',
  accentTransparent: 'accent-transparent-token',
}

describe('Analytics chart theme mapping', () => {
  it('maps semantic chart series to design tokens', () => {
    const colors = buildAnalyticsSeriesColors(tokenFixture)

    expect(colors).toMatchObject({
      success: tokenFixture.success,
      failed: tokenFixture.danger,
      comparison: tokenFixture.info,
      milestone: tokenFixture.accent,
      active: tokenFixture.info,
      warning: tokenFixture.warning,
      platform: tokenFixture.muted,
      grid: tokenFixture.border,
      axis: tokenFixture.muted,
      tooltipBackground: tokenFixture.surface,
      tooltipBorder: tokenFixture.border,
      tooltipText: tokenFixture.text,
      tooltipMuted: tokenFixture.muted,
    })

    expect(colors.pie).toEqual([tokenFixture.success, tokenFixture.info, tokenFixture.danger])
  })
})

export const analyticsThemeCoverage = [
  'success series maps to --success',
  'failed series maps to --danger',
  'comparison series maps to --info',
  'milestone bars map to --accent',
  'axis/grid/tooltip colors map to neutral surface tokens',
]
