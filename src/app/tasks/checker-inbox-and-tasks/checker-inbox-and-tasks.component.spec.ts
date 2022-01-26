import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckerInboxAndTasksComponent } from './checker-inbox-and-tasks.component';

describe('CheckerInboxAndTasksComponent', () => {
  let component: CheckerInboxAndTasksComponent;
  let fixture: ComponentFixture<CheckerInboxAndTasksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckerInboxAndTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerInboxAndTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
