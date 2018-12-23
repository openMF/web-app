/** Angular Imports */
import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';

/**
 * Listener interface containing bindings.
 */
interface Listener {
  bindings: Bindings;
}

/**
 * Keyboard event handler.
 */
type Handler = (event: KeyboardEvent) => boolean | void;

/**
 * Bindings interface for storing the keys command and handler as key-value pair.
 */
interface Bindings {
  [key: string]: Handler;
}

/**
 * Interface to store the normalized keys.
 */
interface NormalizedKeys {
  [key: string]: string;
}

/**
 * Map to normalized keys across different browser implementations.
 */
const KEY_MAP = {
  '\b': 'Backspace',
  '\t': 'Tab',
  '\x7F': 'Delete',
  '\x1B': 'Escape',
  'Del': 'Delete',
  'Esc': 'Escape',
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  'Up': 'ArrowUp',
  'Down': 'ArrowDown',
  'Menu': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'Win': 'OS',
  ' ': 'Space',
  '.': 'Dot'
};

/** Key Alias to be applied after lower casing the command string. */
const KEY_ALIAS = {
  command: 'meta',
  ctrl: 'control',
  del: 'delete',
  down: 'arrowdown',
  esc: 'escape',
  left: 'arrowleft',
  right: 'arrowright',
  up: 'arrowup'
};

/**
 * Keyboard Shortcuts service.
 */
@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private listeners: Listener[];
  private normalizedKeys: NormalizedKeys;
  private zone: NgZone;

  constructor(zone: NgZone) {
    this.zone = zone;

    // List of listeners
    this.listeners = [];
    this.normalizedKeys = Object.create(null);

    // KeyDown Event listener in zone
    this.zone.runOutsideAngular(
      (): void => {
        window.addEventListener('keydown', this.handleKeyboardEvent);
      }
    );
  }

  // To listen to the listener with normalized bindings.
  public listen(bindings: Bindings) {
    const listener = this.addListener({
      bindings: this.normalizeBindings(bindings)
    });
    const unlisten = (): void => {
      this.removeListener(listener);
    };
    return (unlisten);
  }

  // To add list to the list of listeners
  private addListener(listener: Listener): Listener {
    this.listeners.push(listener);
    return (listener);
  }

  // Function to get the keys from the keyboard event
  private getKeyFromEvent(event: KeyboardEvent): string {
    let key = (event.key || event['keyIdentifier'] || 'Unidentified');
    if (key.startsWith('U+')) {
      key = String.fromCharCode(parseInt(key.slice(2), 16));
    }
    const parts = [KEY_MAP[key] || key];
    if (event.altKey) {
      parts.push('Alt');
    }
    if (event.ctrlKey) {
      parts.push('Control');
    }
    if (event.metaKey) {
      parts.push('Meta');
    }
    if (event.shiftKey) {
      parts.push('Shift');
    }
    return (this.normalizeKey(parts.join('.')));
  }

  // To handle keyboard event
  private handleKeyboardEvent = (event: KeyboardEvent): void => {
    const key = this.getKeyFromEvent(event);
    const isInputEvent = this.isEventFromInput(event);
    let handler: Handler;

    // Iterate over the listeners in DESCENDING priority order.
    for (const listener of this.listeners) {
      if (handler = listener.bindings[key]) {
        // Execute handler if this is NOT an input event that we need to ignore.
        if (!isInputEvent) {
          const result = this.zone.runGuarded(
            (): boolean | void => {
              return (handler(event));
            }
          );

          /**
           * If the handler returned an explicit False, treating this listener as Terminal, regardless of the original settings.
           */
          if (result === false) {
            return;
          } else if (result === true) {
            continue;
          }
        }
      }
    }
  }

  // To check if input is from Keyboard
  private isEventFromInput(event: KeyboardEvent): boolean {
    if (event.target instanceof Node) {
      switch (event.target.nodeName) {
        case 'INPUT':
        case 'SELECT':
        case 'TEXTAREA':
          return (true);
        default:
          return (false);
      }
    }
    return (false);
  }

  // To normalize key bindings
  private normalizeBindings(bindings: Bindings): Bindings {
    const normalized = Object.create(null);
    for (const key of Object.keys(bindings)) {
      normalized[this.normalizeKey(key)] = bindings[key];
    }
    return (normalized);
  }

  // To return the given key in a normalized, predictable format.
  private normalizeKey(key: string): string {
    if (!this.normalizedKeys[key]) {
      this.normalizedKeys[key] = key
        .toLowerCase()
        .split('.')
        .map(
          (segment): string => {
            return (KEY_ALIAS[segment] || segment);
          }
        )
        .sort()
        .join('.');
    }
    return (this.normalizedKeys[key]);
  }

  // To remove the given listener from the internal collection.
  private removeListener(listenerToRemove: Listener): void {
    this.listeners = this.listeners.filter(
      (listener: Listener): boolean => {
        return (listener !== listenerToRemove);
      }
    );
  }
}
