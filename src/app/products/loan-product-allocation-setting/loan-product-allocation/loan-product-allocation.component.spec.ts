import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductAllocationComponent } from './loan-product-allocation.component';

describe('LoanProductAllocationComponent', () => {
  let component: LoanProductAllocationComponent;
  let fixture: ComponentFixture<LoanProductAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductAllocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
