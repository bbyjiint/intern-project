/**
 * Design Tokens - Global Dark Mode Color System (Figma)
 * 
 * These colors are the official design system for CompanyHub.
 * Use these values consistently across all pages and components.
 * 
 * DO NOT use arbitrary colors unless explicitly requested.
 */

export const colors = {
  // Background colors
  bgPrimary: '#121316',      // Primary background
  bgSecondary: '#121212',    // Secondary (navbar / sections)
  bgInput: '#1A1C22',        // Input fields
  bgCard: '#1A1C22',         // Cards / containers
  
  // Text colors
  textPrimary: '#FFFFFF',    // Primary (headings, titles, logo)
  textSecondary: '#A9B4CD',  // Secondary (labels, nav links)
  textParagraph: '#8CA2C0',  // Paragraph text
  textPlaceholder: '#6B7C93', // Placeholder text
  
  // Accent colors
  accentMain: '#0273B1',     // Main blue
  accentHover: '#0284CC',    // Hover blue
  accentLogo: '#3276FA',     // Logo dot
  
  // Border colors
  borderDefault: '#486284',  // Default border
  borderSubtle: 'rgba(239, 243, 250, 0.2)', // Subtle border
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
