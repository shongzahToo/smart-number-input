export type InvalidReason = 'negative-violation' | 'min-violation' | 'max-violation';

export interface InvalidContext {
  /** Raw string the user attempted to input */
  attempted: string;
  /** Parsed numeric value or null if not parseable */
  parsed: number | null;
  /** Previous numeric value before the change */
  oldValue: number | null;
  /** The input element being managed */
  element: HTMLInputElement;
}

export interface NumberInputOptions {
  /**
   * Numeral.js format used while the input has focus.
   * @default "0,0[.]00"
   */
  focusFormat?: string;
  /**
   * Numeral.js format used when the input is blurred.
   * @default "0,0.00"
   */
  blurFormat?: string;
  /** Whether negative values are allowed. @default true */
  allowNegative?: boolean;
  /** Minimum allowed value (inclusive). */
  min?: number;
  /** Maximum allowed value (inclusive). */
  max?: number;
  /**
   * Increment/decrement step for ArrowUp/ArrowDown.
   * You may also pass `step` as an alias.
   * @default 1
   */
  stepValue?: number;
  /** Alias for stepValue. */
  step?: number;
  /**
   * Called whenever the underlying numeric value changes.
   * Receives the new value and the previous value (both can be null).
   */
  valueChangeCallback?: (newValue: number | null, oldValue: number | null) => void;
  /** Alias for valueChangeCallback. */
  onValueChange?: (newValue: number | null, oldValue: number | null) => void;
  /**
   * Called when user input is rejected due to constraints.
   * `reason` is either a single reason or a string array if multiple apply.
   */
  invalidInputCallback?: (reason: InvalidReason | InvalidReason[], ctx: InvalidContext) => void;
  /** Alias for invalidInputCallback. */
  onInvalidInput?: (reason: InvalidReason | InvalidReason[], ctx: InvalidContext) => void;
}

export interface NumberInputHandle {
  /** Remove all event listeners and restore the element. */
  destroy(): void;
}

/**
 * Enhance an existing <input> element with numeric formatting/validation.
 * Note: At runtime this overrides the element's string `value` property to keep
 */
export function createNumberInput(
  element: HTMLInputElement,
  options?: NumberInputOptions
): NumberInputHandle;
