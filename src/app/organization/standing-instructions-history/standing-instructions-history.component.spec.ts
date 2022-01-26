import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StandingInstructionsHistoryComponent } from './standing-instructions-history.component';

describe('StandingInstructionsHistoryComponent', () => {
  let component: StandingInstructionsHistoryComponent;
  let fixture: ComponentFixture<StandingInstructionsHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StandingInstructionsHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandingInstructionsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
