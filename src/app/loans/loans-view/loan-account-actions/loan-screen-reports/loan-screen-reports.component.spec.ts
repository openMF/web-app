import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanScreenReportsComponent } from './loan-screen-reports.component';

describe('LoanScreenReportsComponent', () => {
  let component: LoanScreenReportsComponent;
  let fixture: ComponentFixture<LoanScreenReportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanScreenReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanScreenReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
