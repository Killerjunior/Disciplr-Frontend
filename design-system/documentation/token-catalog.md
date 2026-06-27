# Token Catalog

This catalog maps token groups to their runtime CSS variables, utility files,
and component consumers. Keep it current when adding tokens or migrating
components to the design system.

| Token group | Token source | Runtime variables or utilities | Current consumers |
| --- | --- | --- | --- |
| Core color surfaces | `tokens/colors.json` | `--bg`, `--surface`, `--surface-raised`, `--border`, `--text`, `--muted`, `--hover` in `src/index.css` | `Layout`, `Dashboard`, `VaultCard`, `Field`, `ConfirmationModal`, wallet components, notification settings |
| Semantic colors | `tokens/colors.json` | `--accent`, `--accent-dim`, `--accent-transparent`, `--danger`, `--success`, `--warning`, `--info` | Primary actions, dashboard status badges, analytics filters, notification toggles, icons, focus rings |
| Chart colors | `tokens/colors.json` | Read through `src/pages/analyticsTheme.ts` and documented in `documentation/chart-palette.md` | `Analytics`, Recharts series, chart tooltips, chart screen-reader summaries |
| Typography | `tokens/typography.json` | `--font-size-*`, `--line-height-*`, `--font-weight-*`, `.text-*` classes, `src/utils/typography.ts` | `Text`, page headings, captions, body copy, dashboard metrics, financial mono text |
| Spacing | `tokens/spacing.json` | `--spacing-*`, `--container-*`, `--touch-target`; responsive breakpoints documented in `documentation/breakpoints.md` | Page sections, form spacing, cards, grids, navigation, dashboard panels |
| Borders and radius | `tokens/borders.json` | `--radius-*`, `--border-width-*`, `--border-default`, `--border-subtle`, `--border-emphasis`, `--border-interactive`, `--border-error`, `--border-success` | `Field`, `VaultCard`, `ConfirmationModal`, wallet dropdowns, pills, avatars, focus states |
| Shadows | `tokens/shadows.json` | Elevation references for raised surfaces and overlays | Modals, dropdowns, raised cards, dashboard surfaces |
| Motion | `tokens/motion.json` | `src/utils/motion.ts` exports `duration`, `ease`, `transitionEnter`, `transitionExit`, and `transitionPage` | `Notification`, animated overlays, dropdowns, page transitions |

## Component Notes

- `Text` should be the default wrapper for semantic typography roles. It maps
  roles to the responsive text classes in `src/index.css`.
- `Field` consumes border, radius, focus, spacing, and text tokens. See
  `documentation/field.md` before changing form-control styles.
- `VaultCard` consumes surface, border, radius, spacing, success/accent status,
  and typography tokens.
- `ConfirmationModal` consumes overlay, surface, radius, spacing, action, focus,
  and accessibility patterns documented in `documentation/confirmation-modal.md`.
- Analytics views should use the chart palette and `src/pages/analyticsTheme.ts`
  instead of hard-coded chart colors.

## Security: Token File Loading

`loadTokens(tokenFile)` in `design-system/src/utils/token-loader.ts` confines
all file reads to the `tokens/` directory:

- The argument must be a plain basename (no `/`, `\`, or leading dots) with a
  `.json` extension; anything else throws immediately.
- The resolved path is asserted to remain inside `path.resolve(cwd, 'tokens')`
  before the file is opened; a mismatch throws a `Path traversal detected`
  error.

Pass only static, trusted names (e.g. `'colors.json'`). Never derive the
`tokenFile` argument from user-supplied or untrusted input.

## Validation Entry Points

> 📝 **Adding a new token?** Please refer to the [Token Authoring Guide](./token-authoring.md) for required formats, naming conventions, and validation rules.

Token shape validation lives in `design-system/src/utils/validators.ts`:

- `isValidHexColor`, `isValidRgbColor`, `isValidHslColor`, and
  `isValidColorString` validate raw color values.
- `isKebabCase` and `hasValidTokenPrefix` validate token naming conventions.
- `isValidColorToken` validates color token objects and optional accessibility
  metadata.
- `isValidChartTokens` validates chart surface, categorical, and sequential
  ramps.

When a token group changes, update the token file, runtime CSS or utility
mapping, this catalog, and the relevant focused docs in `documentation/`.
