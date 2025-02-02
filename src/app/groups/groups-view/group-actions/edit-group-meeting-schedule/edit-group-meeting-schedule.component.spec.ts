import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGroupMeetingScheduleComponent } from './edit-group-meeting-schedule.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('EditGroupMeetingScheduleComponent', () => {
  let component: EditGroupMeetingScheduleComponent;
  let fixture: ComponentFixture<EditGroupMeetingScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditGroupMeetingScheduleComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupMeetingScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
