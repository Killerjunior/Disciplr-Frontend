# Notification Settings Theming

NotificationSettings uses semantic app tokens instead of fixed light-mode Tailwind colors:

- Panels use `--surface`, `--text`, and `--border`.
- Form controls use `--surface-raised`, `--text`, `--border`, and `--accent` focus outlines.
- Toggle tracks use neutral surface tokens when off and `--accent` when checked.
- Toggle thumbs use `--bg`, `--surface`, and `--border` so they remain visible in light and dark themes.
- Peer focus rings keep the existing Tailwind focus affordance and theme the ring with `--accent-transparent`.

These tokens are backed by `design-system/tokens/colors.json` neutral and secondary/accent values and mirrored in `src/index.css` for runtime theme switching.
