import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositsAccountActionsComponent } from './fixed-deposits-account-actions.component';

describe('FixedDepositsAccountActionsComponent', () => {
  let component: FixedDepositsAccountActionsComponent;
  let fixture: ComponentFixture<FixedDepositsAccountActionsComponent>;

  beforeEach(async(() => {
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
