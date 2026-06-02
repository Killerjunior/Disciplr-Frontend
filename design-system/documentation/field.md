# Field Component

A reusable form field component that bundles a label, input, hint text, and error state.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | ✅ | The field label text |
| hint | string | ❌ | Optional hint text to display below the input |
| error | string | ❌ | Optional error text to display (overrides hint) |
| required | boolean | ❌ | Whether the field is required (adds asterisk and required attribute) |
| ...inputProps | InputHTMLAttributes | ❌ | All native input props are passed through |

## Example Usage

```tsx
import { Field } from '../components/Field'

<Field
  label="Amount (USDC)"
  type="text"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  placeholder="1000"
  required
/>
```
