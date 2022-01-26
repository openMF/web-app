import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StandingInstructionsTabComponent } from './standing-instructions-tab.component';

describe('StandingInstructionsTabComponent', () => {
  let component: StandingInstructionsTabComponent;
  let fixture: ComponentFixture<StandingInstructionsTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StandingInstructionsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandingInstructionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
