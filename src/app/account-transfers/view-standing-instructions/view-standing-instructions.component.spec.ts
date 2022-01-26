import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewStandingInstructionsComponent } from './view-standing-instructions.component';

describe('ViewStandingInstructionsComponent', () => {
  let component: ViewStandingInstructionsComponent;
  let fixture: ComponentFixture<ViewStandingInstructionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewStandingInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewStandingInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
