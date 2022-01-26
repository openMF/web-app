import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssignLoanOfficerComponent } from './assign-loan-officer.component';

describe('AssignLoanOfficerComponent', () => {
  let component: AssignLoanOfficerComponent;
  let fixture: ComponentFixture<AssignLoanOfficerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignLoanOfficerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignLoanOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
