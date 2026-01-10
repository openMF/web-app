import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Cache for storing lookup maps per options array reference.
 * Uses WeakMap to allow garbage collection when options arrays are no longer referenced.
 * Structure: WeakMap<optionsArray, Map<lookupKey, Map<lookupValue, optionObject>>>
 */
const lookupCache = new WeakMap<any[], Map<string, Map<any, any>>>();

@Pipe({ name: 'find' })
export class FindPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: any, options: any, key: string, property: string): string {
    if (!options || !key || value === null || value === undefined) {
      return '';
    }

    // Get or create the cache for this options array
    let keyMap = lookupCache.get(options);
    if (!keyMap) {
      keyMap = new Map<string, Map<any, any>>();
      lookupCache.set(options, keyMap);
    }

    // Get or create the lookup map for this specific key
    let valueMap = keyMap.get(key);
    if (!valueMap) {
      // Build the lookup map: O(n) - but only once per options array + key combination
      valueMap = new Map<any, any>();
      if (Array.isArray(options)) {
        for (const option of options) {
          if (option && option[key] !== undefined && option[key] !== null) {
            valueMap.set(option[key], option);
          }
        }
      }
      keyMap.set(key, valueMap);
    }

    // O(1) lookup
    const optionFound = valueMap.get(value);
    const result = optionFound ? (optionFound[property] ?? '') : '';

    // Sanitize string results to prevent XSS
    if (typeof result === 'string') {
      return this.sanitizer.sanitize(SecurityContext.HTML, result) || '';
    }

    return String(result || '');
  }
}
