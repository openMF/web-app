import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCenterMeetingScheduleComponent } from './edit-center-meeting-schedule.component';

describe('EditCenterMeetingScheduleComponent', () => {
  let component: EditCenterMeetingScheduleComponent;
  let fixture: ComponentFixture<EditCenterMeetingScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCenterMeetingScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCenterMeetingScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
