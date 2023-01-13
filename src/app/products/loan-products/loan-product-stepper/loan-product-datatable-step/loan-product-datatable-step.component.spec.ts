import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductDatatableStepComponent } from './loan-product-datatable-step.component';

describe('LoanProductDatatableStepComponent', () => {
  let component: LoanProductDatatableStepComponent;
  let fixture: ComponentFixture<LoanProductDatatableStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductDatatableStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductDatatableStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
