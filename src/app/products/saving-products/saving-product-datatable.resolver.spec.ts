import { TestBed } from '@angular/core/testing';

import { SavingProductDatatableResolver } from './saving-product-datatable.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('SavingProductDatatableResolver', () => {
  let resolver: SavingProductDatatableResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(SavingProductDatatableResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
