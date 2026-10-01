/*!
 * Lattice Grid 1.84.0, presets module type declarations
 * Copyright (c) 2026 TOCLOCO Inc. All rights reserved.
 * https://latticegrid.dev
 */
/**
 * The slice of a real MUI `Theme` (`createTheme()`'s return value)
 * {@link themeFromMui} reads. Loose and hand-shaped rather than imported
 * from `@mui/material` — this package ships zero runtime dependencies
 * (CONTRACTS §0), so `themeFromMui` takes any plain object with this shape,
 * not only a real MUI `Theme` instance.
 */
export interface MuiTheme {
  /** The colours: mode, the five status roles, the surfaces, text and the grey ramp. */
  palette: {
    /** `'light'` or `'dark'`; anything else is read as light. */
    mode?: 'light' | 'dark';
    primary: { main: string; contrastText: string };
    error: { main: string };
    warning: { main: string };
    success: { main: string };
    info: { main: string };
    background: { default: string; paper: string };
    text: { primary: string; secondary: string };
    /** The divider colour, read straight through to `--lattice-border-color`. */
    divider: string;
    /** MUI's grey ramp; `50`, `400` and `600` are the shades this reads. */
    grey: Record<number, string>;
  };
  /** The type scale: the default face, MUI's own font-weight name, and body text size. */
  typography: {
    fontFamily: string;
    body2: { fontSize: string | number };
    fontWeightMedium: number;
  };
  /** The one shape token MUI's theme carries: the corner radius. */
  shape: {
    /** Pixels; MUI's own unit — no `px` suffix. */
    borderRadius: number;
  };
}

/** What {@link themeFromMui} hands back. */
export interface MuiThemeResult {
  /** The tokens as one ready-to-inject `.lattice { --lattice-*: …; }` rule. */
  cssText: string;
  /**
   * Set every token this call resolved as an inline custom property on
   * `element`, and return it. Call {@link themeFromMui} again with the
   * theme that changed and `apply()` its result to re-apply — there is no
   * internal state to update in place.
   */
  apply<T extends { style?: { setProperty?: (name: string, value: string) => void } }>(element: T): T;
}

/**
 * Read a real MUI `createTheme()` object's palette (including `mode`),
 * typography and shape, and return the matching Lattice `--lattice-*`
 * tokens. Meant to be layered OVER `material3.css`: a MUI theme carries no
 * "hover background" or "focus ring width" role, and the static preset is
 * what fills those in.
 */
export function themeFromMui(theme: MuiTheme): MuiThemeResult;
export default themeFromMui;
