import { TestBed } from '@angular/core/testing';

import { LoanProductDatatablesResolver } from './loan-product-datatables.resolver';

describe('LoanProductDatatablesResolver', () => {
  let resolver: LoanProductDatatablesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(LoanProductDatatablesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
