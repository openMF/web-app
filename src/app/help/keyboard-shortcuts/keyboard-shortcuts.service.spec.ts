import { TestBed } from '@angular/core/testing';

import { KeyboardShortcutsService } from './keyboard-shortcuts.service';

describe('KeyboardShortcutsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KeyboardShortcutsService = TestBed.get(KeyboardShortcutsService);
    expect(service).toBeTruthy();
  });
});
