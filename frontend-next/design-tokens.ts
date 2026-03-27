/**
 * Design Tokens - Global Color System
 *
 * These colors are the official design system for CompanyHub.
 * Use these values consistently across all pages and components.
 *
 * DO NOT use arbitrary colors unless explicitly requested.
 */

export const colors = {
  // Primary button color - Use for ALL buttons (CTA, submit, login, etc.)
  primary: '#0273B1',
  primaryHover: '#025a8f',

  // Primary font color - Use for main text throughout the website
  primaryText: '#1C2D4F',

  // Font hover / secondary text color - Use for hover states, secondary text, muted text
  secondaryText: '#A9B4CD',
} as const

/**
 * Usage Examples:
 *
 * Buttons:
 *   backgroundColor: colors.primary
 *   hover: colors.primaryHover
 *
 * Text:
 *   color: colors.primaryText (for main text)
 *   color: colors.secondaryText (for secondary/muted text, hover states)
 */
