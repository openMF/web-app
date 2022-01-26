import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositsAccountActionsComponent } from './fixed-deposits-account-actions.component';

describe('FixedDepositsAccountActionsComponent', () => {
  let component: FixedDepositsAccountActionsComponent;
  let fixture: ComponentFixture<FixedDepositsAccountActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositsAccountActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositsAccountActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
