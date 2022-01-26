import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingsAccountAssignStaffComponent } from './savings-account-assign-staff.component';

describe('SavingsAccountAssignStaffComponent', () => {
  let component: SavingsAccountAssignStaffComponent;
  let fixture: ComponentFixture<SavingsAccountAssignStaffComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountAssignStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountAssignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
