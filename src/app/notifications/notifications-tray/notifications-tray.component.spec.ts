import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsTrayComponent } from './notifications-tray.component';

describe('NotificationsTrayComponent', () => {
  let component: NotificationsTrayComponent;
  let fixture: ComponentFixture<NotificationsTrayComponent>;

  beforeEach(async(() => {
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
