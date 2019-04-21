import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNotificationComponent } from './edit-notification.component';

describe('EditNotificationComponent', () => {
  let component: EditNotificationComponent;
  let fixture: ComponentFixture<EditNotificationComponent>;

  beforeEach(async(() => {
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
