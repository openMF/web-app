import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckerInboxComponent } from './checker-inbox.component';

describe('CheckerInboxComponent', () => {
  let component: CheckerInboxComponent;
  let fixture: ComponentFixture<CheckerInboxComponent>;

  beforeEach(async(() => {
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
