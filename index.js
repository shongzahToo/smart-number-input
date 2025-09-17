import numeral from "numeral";

function createNumberInput(element, options = {}) {

    if (!(element instanceof HTMLInputElement)) {
        throw new TypeError('createNumberInput: "element" must be an <input> element');
    }

    // --- defaults ---
    const opts = {
        focusFormat: options.focusFormat || "0.[000000000000000]",
        blurFormat: options.blurFormat || "0.[0]",
        allowNegative: options.allowNegative !== undefined ? options.allowNegative : true,
        min: options.min,
        max: options.max,
        stepValue: options.stepValue ?? options.step ?? 1,
        valueChangeCallback: options.valueChangeCallback || options.onValueChange || null,
        invalidInputCallback: options.invalidInputCallback || options.onInvalidInput || null,
    };

    // Save native descriptor to interact with the real underlying value safely
    const nativeDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

    // Utility property to allow for direct text reading
    Object.defineProperty(element, 'textValue', {
        get() {
            return nativeDescriptor.get.call(element)
        },
        set(v) {
            nativeDescriptor.set.call(element, v)
        }
    })

    // Private numeric value (null for empty/invalid)
    let _realValue = parseToNumber(element.textValue);

    // helper to safely parse with numeral -> returns number or null
    function parseToNumber(input) {
        // Handle empty string explicitly
        if (input === '' || input == null) return null;

        // input could be string or number
        const v = numeral(input).value();
        // numeral returns null for unparsable
        if (v === null || Number.isNaN(v) || !isFinite(v)) return null;
        return v;
    }

    // helper to format number or return empty string for null
    function formatOrEmpty(num, fmt) {
        return num === null ? '' : numeral(num).format(fmt);
    }

    // Helper to call value change callback consistently
    function callValueChangeCallback(newValue, oldValue) {
        if (typeof opts.valueChangeCallback === 'function') {
            try {
                opts.valueChangeCallback(newValue, oldValue);
            } catch (e) {
                console.warn('Error in valueChangeCallback:', e);
            }
        }
    }

    // Override value to preserve HTML semantics: keep string interface but keep setter behaviour
    Object.defineProperty(element, 'value', {
        get() {
            return _realValue === null ? "" : String(_realValue);
        }
        ,
        set(v) {
            const old = _realValue;
            const valueStr = v == null ? '' : String(v);
            _realValue = parseToNumber(valueStr);
            callValueChangeCallback(_realValue, old);
            element.textValue = formatOrEmpty(_realValue, document.activeElement === element ? opts.focusFormat : opts.blurFormat);
        },
        configurable: true
    });

    // Event handlers
    function onInput(ev) {
        const raw = element.textValue;
        const parsed = parseToNumber(raw);

        // Handle empty input
        if (parsed === null) {
            const old = _realValue;
            _realValue = null;
            callValueChangeCallback(_realValue, old);
            return;
        }

        // collect violation reasons
        const reasons = [];

        if (!opts.allowNegative && parsed < 0) {
            reasons.push('negative-violation');
            _realValue = 0
        }
        if (opts.min !== undefined && parsed < opts.min) {
            reasons.push('min-violation');
            _realValue = opts.min
        }
        if (opts.max !== undefined && parsed > opts.max) {
            reasons.push('max-violation');
            _realValue = opts.max
        }

        const valid = reasons.length === 0;

        if (valid) {
            const old = _realValue;
            _realValue = parsed;
            callValueChangeCallback(_realValue, old);
        } else {
            // Call invalidInputCallback once, with context
            if (typeof opts.invalidInputCallback === 'function') {
                try {
                    opts.invalidInputCallback(reasons.length === 1 ? reasons[0] : reasons, {
                        attempted: raw,
                        parsed,
                        oldValue: _realValue,
                        element
                    });
                } catch (e) {
                    console.warn('Error in invalidInputCallback:', e);
                }
            }
        }
    }

    function onBlur() {
        element.textValue = formatOrEmpty(_realValue, opts.blurFormat);
    }

    function onFocus() {
        element.textValue = formatOrEmpty(_realValue, opts.focusFormat);
    }

    function onKeydown(ev) {
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
            ev.preventDefault();
            const current = _realValue === null ? 0 : _realValue;
            const delta = (opts.stepValue || 1) * (ev.key === 'ArrowUp' ? 1 : -1);
            let candidate = current + delta;

            // Check bounds
            if (opts.min !== undefined && candidate < opts.min) {
                candidate = opts.min;
            }
            if (opts.max !== undefined && candidate > opts.max) {
                candidate = opts.max;
            }
            if(opts.allowNegative !== undefined && candidate < 0) {
                candidate = 0;
            }

            const old = _realValue;
            _realValue = candidate;
            element.textValue = formatOrEmpty(_realValue, document.activeElement === element ? opts.focusFormat : opts.blurFormat);
            callValueChangeCallback(_realValue, old);
        }
    }

    element.addEventListener('input', onInput);
    element.addEventListener('blur', onBlur);
    element.addEventListener('focus', onFocus);
    element.addEventListener('keydown', onKeydown);

    // initialize displayed text to blurFormat (or keep native if desired)
    element.textValue = formatOrEmpty(_realValue, opts.blurFormat)

    // return a destroy function so consumers can cleanup
    return {
        destroy() {
            element.removeEventListener('input', onInput);
            element.removeEventListener('blur', onBlur);
            element.removeEventListener('focus', onFocus);
            element.removeEventListener('keydown', onKeydown);
            // remove overridden own property so prototype's descriptor is used:
            try { delete element.value; } catch (e) { }
        }
    };
}

export { createNumberInput };