import { TestBed } from '@angular/core/testing';

import { EditRetailOutletResolver } from './edit-retail-outlet.resolver';

describe('EditRetailOutletResolver', () => {
  let resolver: EditRetailOutletResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(EditRetailOutletResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
