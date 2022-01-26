import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditGroupMeetingComponent } from './edit-group-meeting.component';

describe('EditGroupMeetingComponent', () => {
  let component: EditGroupMeetingComponent;
  let fixture: ComponentFixture<EditGroupMeetingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGroupMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
