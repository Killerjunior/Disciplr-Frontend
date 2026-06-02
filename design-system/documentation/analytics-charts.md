# Analytics Chart Tokens

Analytics charts resolve runtime CSS variables from `src/index.css`, which mirrors `design-system/tokens/colors.json`:

- Success series use `--success`.
- Failed/error series use `--danger`.
- Comparison series use `--info`.
- Milestone and primary bars use `--accent`.
- Axes, grid lines, legends, and tooltip supporting text use neutral tokens such as `--muted`, `--border`, `--surface`, and `--text`.

`src/pages/Analytics.tsx` recomputes chart colors when `data-theme` changes so Recharts receives concrete color values for the active light or dark theme. Chart containers use Recharts `ResponsiveContainer` for fluid width behavior.

Each chart includes a screen-reader summary adjacent to the visual chart. Animated Recharts series are disabled when the user prefers reduced motion.
