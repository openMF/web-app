import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckerInboxComponent } from './checker-inbox.component';

describe('CheckerInboxComponent', () => {
  let component: CheckerInboxComponent;
  let fixture: ComponentFixture<CheckerInboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckerInboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
