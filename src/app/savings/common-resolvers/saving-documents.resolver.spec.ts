import { TestBed } from '@angular/core/testing';

import { SavingDocumentsResolver } from './saving-documents.resolver';

describe('SavingDocumentsResolver', () => {
  let resolver: SavingDocumentsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(SavingDocumentsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
