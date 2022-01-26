import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotificationsTrayComponent } from './notifications-tray.component';

describe('NotificationsTrayComponent', () => {
  let component: NotificationsTrayComponent;
  let fixture: ComponentFixture<NotificationsTrayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsTrayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
