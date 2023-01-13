import { TestBed } from '@angular/core/testing';

import { SavingProductDatatableResolver } from './saving-product-datatable.resolver';

describe('SavingProductDatatableResolver', () => {
  let resolver: SavingProductDatatableResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(SavingProductDatatableResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
