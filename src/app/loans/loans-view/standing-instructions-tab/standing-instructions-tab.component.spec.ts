import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingInstructionsTabComponent } from './standing-instructions-tab.component';

describe('StandingInstructionsTabComponent', () => {
  let component: StandingInstructionsTabComponent;
  let fixture: ComponentFixture<StandingInstructionsTabComponent>;

  beforeEach(async(() => {
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
