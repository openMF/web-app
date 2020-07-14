import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterAssignStaffComponent } from './center-assign-staff.component';

describe('CenterAssignStaffComponent', () => {
  let component: CenterAssignStaffComponent;
  let fixture: ComponentFixture<CenterAssignStaffComponent>;

  beforeEach(async(() => {
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
