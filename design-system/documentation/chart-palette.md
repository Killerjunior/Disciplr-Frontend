# Chart Palette & Data Visualization Tokens

This documentation outlines the design system's centralized token set for charts and data visualization. These tokens are engineered to replace all ad-hoc chart colors across the Disciplr frontend with an accessible, colorblind-safe, and contrast-compliant foundation.

---

## 🎨 Token Architecture

The chart color palette is divided into three key categories:
1. **Categorical Palette**: Designed for discrete data items (e.g., different vaults, distinct transactional classes, multi-series line charts).
2. **Sequential Palette**: Designed for quantitative or ordered data ranges where intensity correlates with value magnitude (e.g., heatmap cells, density plots).
3. **Chart Surfaces & Lines**: Tokens for visual structure, such as grid lines, axes, and interactive tooltips.

---

## 📊 Categorical Color Ramp (WCAG 2.1 AA Compliant)

Our categorical colors provide vibrant, highly distinguishable series keys. They are mathematically curated to achieve at least **3.0:1 contrast** (target WCAG AA graphical elements threshold) against white backgrounds in Light mode, and against `Neutral-900` (#111827) in Dark mode.

Furthermore, they have been validated under simulated colorblind conditions (Protanopia, Deuteranopia, Tritanopia) to ensure pairwise distinctness.

| Series Step | Light Hex | Dark Hex | Light Contrast (vs White) | Dark Contrast (vs #111827) | Primary Simulated Hues (P / D / T) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **Step 1** (Blue) | `#1E40AF` | `#3B82F6` | **8.72** | **4.82** | `#1E3FAF` / `#1E40AF` / `#1D41B0` |
| **Step 2** (Teal) | `#0D9488` | `#14B8A6` | **3.74** | **7.13** | `#798782` / `#828583` / `#009494` |
| **Step 3** (Amber) | `#D97706` | `#F59E0B` | **3.19** | **8.26** | `#B69000` / `#A89800` / `#D87228` |
| **Step 4** (Purple) | `#6D28D9` | `#8B5CF6` | **7.10** | **4.19** | `#3D54DB` / `#245CDB` / `#6A37AC` |
| **Step 5** (Pink) | `#BE185D` | `#EC4899` | **6.04** | **5.03** | `#7D6A74` / `#8C6372` / `#BD2044` |

---

## 📈 Sequential Color Ramp

The sequential ramp uses a high-contrast monochromatic blue progression to represent progressive density or intensity.

* **Light Mode**: Ramps from very light tint (`#E0F2FE`, lowest intensity) to high-contrast deep blue (`#0C4A6E`, highest intensity).
* **Dark Mode**: Ramps from deep navy (`#0C4A6E`, lowest intensity) to very bright sky blue (`#E0F2FE`, highest intensity).

| Step | Light Hex | Dark Hex | Light Contrast (vs White) | Dark Contrast (vs #111827) | Intensity Profile |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | `#E0F2FE` | `#0C4A6E` | 1.15 | 1.88 | **Lowest Intensity** |
| **2** | `#7DD3FC` | `#0369A1` | 1.67 | 2.99 | Low |
| **3** | `#0EA5E9` | `#0EA5E9` | 2.77 | 6.40 | Medium |
| **4** | `#0369A1` | `#7DD3FC` | 5.93 | 10.64 | High |
| **5** | `#0C4A6E` | `#E0F2FE` | 9.46 | 15.46 | **Highest Intensity** |

---

## 🛠️ Chart Axis & Gridline Tokens

For supporting lines, borders, and interactive states:

* **`color-chart-axis`**: Used for drawing axis lines and tick marks.
  * **Light**: `#6B7280` (Medium gray)
  * **Dark**: `#9CA3AF` (Light gray)
* **`color-chart-grid`**: Used for lightweight background Cartesian grids.
  * **Light**: `#E5E7EB` (Subtle gray boundary line)
  * **Dark**: `#1F2937` (Deep dark slate background line)

---

## 💬 Interactive Tooltip Elements

Fully integrated tooltip surfaces that float over visualization widgets:

* **`color-chart-tooltipBg`**:
  * **Light**: `#FFFFFF` | **Dark**: `#0C101A` (Clean card surface background)
* **`color-chart-tooltipBorder`**:
  * **Light**: `#E5E7EB` | **Dark**: `#1E2D42` (Boundary separator line)
* **`color-chart-tooltipText`**:
  * **Light**: `#111827` | **Dark**: `#E8EDF5` (High-contrast body metrics text)
* **`color-chart-tooltipLabel`**:
  * **Light**: `#6B7280` | **Dark**: `#6B7A8F` (Subtle label and time-stamp text)

---

## 💻 Technical Usage Guidelines

### 1. In Vanilla CSS & Styling Files

Consuming the tokens natively via custom properties in your stylesheets:

```css
.chart-container {
  background: var(--color-chart-tooltipBg);
  border: 1px solid var(--color-chart-tooltipBorder);
}

.chart-axis-label {
  fill: var(--color-chart-axis);
  font-family: var(--font-sans);
}

.chart-grid-line {
  stroke: var(--color-chart-grid);
}
```

### 2. In Recharts (TypeScript / JSX)

Consuming the tokens directly inside React visualization components using inline style utilities or a theme wrapper hook:

```tsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const PerformanceChart: React.FC = () => {
  // Use our centralized design system custom variables
  const stepPrimary = 'var(--color-chart-categorical-1)';
  const axisColor = 'var(--color-chart-axis)';
  const gridColor = 'var(--color-chart-grid)';
  const tooltipBg = 'var(--color-chart-tooltipBg)';
  const tooltipBorder = 'var(--color-chart-tooltipBorder)';
  const tooltipText = 'var(--color-chart-tooltipText)';
  const tooltipLabel = 'var(--color-chart-tooltipLabel)';

  const data = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
  ];

  return (
    <AreaChart width={600} height={300} data={data}>
      <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
      <XAxis dataKey="name" stroke={axisColor} />
      <YAxis stroke={axisColor} />
      <Tooltip
        contentStyle={{
          backgroundColor: tooltipBg,
          borderColor: tooltipBorder,
          borderRadius: '6px',
        }}
        itemStyle={{ color: tooltipText }}
        labelStyle={{ color: tooltipLabel }}
      />
      <Area 
        type="monotone" 
        dataKey="value" 
        stroke={stepPrimary} 
        fill={stepPrimary} 
        fillOpacity={0.15} 
      />
    </AreaChart>
  );
};
```

---

## ♿ Accessibility Recommendations

When compiling custom dashboards, adhere to the following best practices:
1. **Combine Color with Shape**: Do not rely purely on categorical colors to distinguish series lines. Utilize distinct line stroke-patterns (e.g., `strokeDasharray="4 4"`, `strokeDasharray="1 1"`) or geometric markers (e.g., circle, square, triangle dots).
2. **Text-Labeling**: Always render full textual value readouts inside interactive tooltips. Do not force users to guess the visual magnitude of visual items without concrete readable figures.
3. **Contrast Verification**: Never use low-intensity sequential steps (e.g. Sequential Light Step 1 or 2) to display critical text elements or primary lines, as they are not meant to represent independent readable characters.
