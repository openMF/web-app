import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RescheduleLoanComponent } from './reschedule-loan.component';

describe('RescheduleLoanComponent', () => {
  let component: RescheduleLoanComponent;
  let fixture: ComponentFixture<RescheduleLoanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RescheduleLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RescheduleLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
