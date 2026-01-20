# Design System - CompanyHub

## Color System

This document defines the official color system for CompanyHub. These colors must be used consistently across all pages and components.

### Primary Colors

- **Primary Button Color**: `#0273B1`
  - Use for ALL buttons (CTA, submit, login, register, etc.)
  - Hover state: `#025a8f`
  
- **Primary Font Color**: `#1C2D4F`
  - Use for main text throughout the website
  - Use for headings, body text, and primary content

- **Secondary Text / Hover Color**: `#A9B4CD`
  - Use for hover states on links and buttons
  - Use for secondary text, muted text, and placeholders

### Usage Rules

1. **Buttons**: Always use `#0273B1` for all buttons. No exceptions.
2. **Text**: Use `#1C2D4F` for primary text, `#A9B4CD` for secondary/muted text.
3. **Hover States**: Use `#A9B4CD` for link hover, `#025a8f` for button hover.
4. **No Arbitrary Colors**: Do not use other colors unless explicitly requested.

### Implementation

#### CSS Variables (globals.css)
```css
:root {
  --color-primary: #0273B1;
  --color-primary-hover: #025a8f;
  --color-primary-text: #1C2D4F;
  --color-secondary-text: #A9B4CD;
}
```

#### Tailwind Config
```js
colors: {
  primary: {
    DEFAULT: '#0273B1',
    hover: '#025a8f',
  },
  text: {
    primary: '#1C2D4F',
    secondary: '#A9B4CD',
  },
}
```

#### TypeScript/JavaScript (design-tokens.ts)
```typescript
export const colors = {
  primary: '#0273B1',
  primaryHover: '#025a8f',
  primaryText: '#1C2D4F',
  secondaryText: '#A9B4CD',
}
```

### Examples

#### Button
```tsx
<button
  style={{ backgroundColor: '#0273B1' }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#025a8f'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0273B1'}
>
  Click Me
</button>
```

#### Text
```tsx
<h1 style={{ color: '#1C2D4F' }}>Main Heading</h1>
<p style={{ color: '#A9B4CD' }}>Secondary text</p>
```

#### Link
```tsx
<Link
  className="nav-link"
  style={{ color: '#A9B4CD' }}
  onMouseEnter={(e) => e.currentTarget.style.color = '#1C2D4F'}
>
  Link Text
</Link>
```

---

**Last Updated**: Design tokens established as production standard.
**Status**: Active - Use these colors consistently across all current and future pages.
