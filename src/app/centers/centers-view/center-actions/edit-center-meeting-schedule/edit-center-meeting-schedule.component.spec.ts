import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCenterMeetingScheduleComponent } from './edit-center-meeting-schedule.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditCenterMeetingScheduleComponent', () => {
  let component: EditCenterMeetingScheduleComponent;
  let fixture: ComponentFixture<EditCenterMeetingScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCenterMeetingScheduleComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
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
