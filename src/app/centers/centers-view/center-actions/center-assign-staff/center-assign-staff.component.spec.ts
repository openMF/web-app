import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CenterAssignStaffComponent } from './center-assign-staff.component';

describe('CenterAssignStaffComponent', () => {
  let component: CenterAssignStaffComponent;
  let fixture: ComponentFixture<CenterAssignStaffComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CenterAssignStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterAssignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
