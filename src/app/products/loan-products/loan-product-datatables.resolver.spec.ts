import { TestBed } from '@angular/core/testing';

import { LoanProductDatatablesResolver } from './loan-product-datatables.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('LoanProductDatatablesResolver', () => {
  let resolver: LoanProductDatatablesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(LoanProductDatatablesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
