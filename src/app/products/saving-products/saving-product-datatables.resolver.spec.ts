import { TestBed } from '@angular/core/testing';

import { SavingProductDatatablesResolver } from './saving-product-datatables.resolver';

describe('SavingProductDatatablesResolver', () => {
  let resolver: SavingProductDatatablesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(SavingProductDatatablesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
