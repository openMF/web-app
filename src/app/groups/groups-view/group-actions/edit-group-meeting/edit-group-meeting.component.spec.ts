import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGroupMeetingComponent } from './edit-group-meeting.component';

describe('EditGroupMeetingComponent', () => {
  let component: EditGroupMeetingComponent;
  let fixture: ComponentFixture<EditGroupMeetingComponent>;

  beforeEach(async(() => {
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
