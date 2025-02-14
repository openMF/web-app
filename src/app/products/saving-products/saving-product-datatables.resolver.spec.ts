import { TestBed } from '@angular/core/testing';

import { SavingProductDatatablesResolver } from './saving-product-datatables.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('SavingProductDatatablesResolver', () => {
  let resolver: SavingProductDatatablesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(SavingProductDatatablesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
