import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCheckerInboxComponent } from './view-checker-inbox.component';

describe('ViewCheckerInboxComponent', () => {
  let component: ViewCheckerInboxComponent;
  let fixture: ComponentFixture<ViewCheckerInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCheckerInboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCheckerInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
