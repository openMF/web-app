import { TestBed } from '@angular/core/testing';

import { SavingNotesResolver } from './saving-notes.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('SavingNotesResolver', () => {
  let resolver: SavingNotesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(SavingNotesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
