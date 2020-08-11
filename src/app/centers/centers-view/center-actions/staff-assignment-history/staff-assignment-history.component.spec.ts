import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffAssignmentHistoryComponent } from './staff-assignment-history.component';

describe('StaffAssignmentHistoryComponent', () => {
  let component: StaffAssignmentHistoryComponent;
  let fixture: ComponentFixture<StaffAssignmentHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffAssignmentHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffAssignmentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
