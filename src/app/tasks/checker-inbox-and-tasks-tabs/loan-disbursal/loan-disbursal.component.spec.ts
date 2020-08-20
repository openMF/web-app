import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDisbursalComponent } from './loan-disbursal.component';

describe('LoanDisbursalComponent', () => {
  let component: LoanDisbursalComponent;
  let fixture: ComponentFixture<LoanDisbursalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanDisbursalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanDisbursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
