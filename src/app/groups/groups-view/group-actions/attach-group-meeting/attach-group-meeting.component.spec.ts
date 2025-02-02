import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachGroupMeetingComponent } from './attach-group-meeting.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('AttachGroupMeetingComponent', () => {
  let component: AttachGroupMeetingComponent;
  let fixture: ComponentFixture<AttachGroupMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AttachGroupMeetingComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachGroupMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
