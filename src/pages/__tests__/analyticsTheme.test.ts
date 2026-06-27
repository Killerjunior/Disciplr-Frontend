import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ANALYTICS_TOKEN_FALLBACKS,
  getAnalyticsChartTokens,
  buildAnalyticsSeriesColors,
} from '../analyticsTheme'

// jsdom's getComputedStyle doesn't read inline CSS variables, so we stub it.
function makeRoot(props: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('div')
  vi.spyOn(window, 'getComputedStyle').mockImplementation((target) => {
    if (target === el) {
      return {
        getPropertyValue: (p: string) => props[p] ?? '',
      } as unknown as CSSStyleDeclaration
    }
    return window.getComputedStyle(target)
  })
  return el
}

const CSS_PROPS: Record<keyof typeof ANALYTICS_TOKEN_FALLBACKS, string> = {
  accent: '--accent',
  success: '--success',
  danger: '--danger',
  info: '--info',
  warning: '--warning',
  text: '--text',
  muted: '--muted',
  surface: '--surface',
  surfaceRaised: '--surface-raised',
  border: '--border',
  bg: '--bg',
  accentTransparent: '--accent-transparent',
}

describe('getAnalyticsChartTokens', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves each CSS custom property when all are defined', () => {
    const values: Record<string, string> = {}
    for (const [key, prop] of Object.entries(CSS_PROPS)) {
      values[prop] = `#custom-${key}`
    }
    const root = makeRoot(values)
    const tokens = getAnalyticsChartTokens(root)

    for (const key of Object.keys(CSS_PROPS) as (keyof typeof CSS_PROPS)[]) {
      expect(tokens[key]).toBe(`#custom-${key}`)
    }
  })

  it('falls back to ANALYTICS_TOKEN_FALLBACKS when no properties are set', () => {
    const root = makeRoot({})
    const tokens = getAnalyticsChartTokens(root)
    expect(tokens).toEqual(ANALYTICS_TOKEN_FALLBACKS)
  })

  it('falls back per-key for partially-defined properties', () => {
    const root = makeRoot({ '--accent': '#aabbcc' })
    const tokens = getAnalyticsChartTokens(root)
    expect(tokens.accent).toBe('#aabbcc')
    expect(tokens.success).toBe(ANALYTICS_TOKEN_FALLBACKS.success)
    expect(tokens.danger).toBe(ANALYTICS_TOKEN_FALLBACKS.danger)
  })

  it('treats whitespace-only property values as missing (uses fallback)', () => {
    const root = makeRoot({ '--accent': '   ' })
    const tokens = getAnalyticsChartTokens(root)
    // trim() makes whitespace-only become '' which is falsy → fallback
    expect(tokens.accent).toBe(ANALYTICS_TOKEN_FALLBACKS.accent)
  })

  it('uses document.documentElement when called with no argument', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      getPropertyValue: () => '#default-root',
    } as unknown as CSSStyleDeclaration))

    const tokens = getAnalyticsChartTokens()
    expect(tokens.accent).toBe('#default-root')
  })
})

describe('buildAnalyticsSeriesColors', () => {
  const tokens = getAnalyticsChartTokens(makeRoot({})) // all fallbacks

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('maps series keys to the correct token values', () => {
    const series = buildAnalyticsSeriesColors(tokens)
    expect(series.success).toBe(tokens.success)
    expect(series.failed).toBe(tokens.danger)
    expect(series.comparison).toBe(tokens.info)
    expect(series.milestone).toBe(tokens.accent)
    expect(series.active).toBe(tokens.info)
    expect(series.warning).toBe(tokens.warning)
    expect(series.platform).toBe(tokens.muted)
    expect(series.grid).toBe(tokens.border)
    expect(series.axis).toBe(tokens.muted)
    expect(series.tooltipBackground).toBe(tokens.surface)
    expect(series.tooltipBorder).toBe(tokens.border)
    expect(series.tooltipText).toBe(tokens.text)
    expect(series.tooltipMuted).toBe(tokens.muted)
  })

  it('produces pie as [success, info, danger] in that order', () => {
    const series = buildAnalyticsSeriesColors(tokens)
    expect(series.pie).toEqual([tokens.success, tokens.info, tokens.danger])
  })

  it('contains exactly the expected top-level keys', () => {
    const series = buildAnalyticsSeriesColors(tokens)
    expect(Object.keys(series)).toEqual([
      'success', 'failed', 'comparison', 'milestone', 'active',
      'warning', 'platform', 'grid', 'axis',
      'tooltipBackground', 'tooltipBorder', 'tooltipText', 'tooltipMuted', 'pie',
    ])
  })
})

describe('ANALYTICS_TOKEN_FALLBACKS', () => {
  it('has values for all 12 token keys', () => {
    expect(Object.keys(ANALYTICS_TOKEN_FALLBACKS)).toHaveLength(12)
  })

  it('every value is a non-empty string', () => {
    for (const val of Object.values(ANALYTICS_TOKEN_FALLBACKS)) {
      expect(typeof val).toBe('string')
      expect(val.trim().length).toBeGreaterThan(0)
    }
  })
})
