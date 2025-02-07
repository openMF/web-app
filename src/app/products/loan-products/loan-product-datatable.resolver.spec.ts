import { TestBed } from '@angular/core/testing';

import { LoanProductDatatableResolver } from './loan-product-datatable.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('LoanProductDatatableResolver', () => {
  let resolver: LoanProductDatatableResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(LoanProductDatatableResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
