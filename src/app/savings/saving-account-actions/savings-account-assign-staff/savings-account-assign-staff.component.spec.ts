import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountAssignStaffComponent } from './savings-account-assign-staff.component';

describe('SavingsAccountAssignStaffComponent', () => {
  let component: SavingsAccountAssignStaffComponent;
  let fixture: ComponentFixture<SavingsAccountAssignStaffComponent>;

  beforeEach(async(() => {
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
