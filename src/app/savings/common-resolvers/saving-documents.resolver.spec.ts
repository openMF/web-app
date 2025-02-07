import { TestBed } from '@angular/core/testing';

import { SavingDocumentsResolver } from './saving-documents.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('SavingDocumentsResolver', () => {
  let resolver: SavingDocumentsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(SavingDocumentsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
