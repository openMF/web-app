import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStandingInstructionsComponent } from './view-standing-instructions.component';

describe('ViewStandingInstructionsComponent', () => {
  let component: ViewStandingInstructionsComponent;
  let fixture: ComponentFixture<ViewStandingInstructionsComponent>;

  beforeEach(async(() => {
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
