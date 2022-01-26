import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditNotificationComponent } from './edit-notification.component';

describe('EditNotificationComponent', () => {
  let component: EditNotificationComponent;
  let fixture: ComponentFixture<EditNotificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
