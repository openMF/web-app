import { TestBed } from '@angular/core/testing';

import { LoanProductDatatableResolver } from './loan-product-datatable.resolver';

describe('LoanProductDatatableResolver', () => {
  let resolver: LoanProductDatatableResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(LoanProductDatatableResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
