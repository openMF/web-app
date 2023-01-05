import { TestBed } from '@angular/core/testing';

import { SavingNotesResolver } from './saving-notes.resolver';

describe('SavingNotesResolver', () => {
  let resolver: SavingNotesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(SavingNotesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
