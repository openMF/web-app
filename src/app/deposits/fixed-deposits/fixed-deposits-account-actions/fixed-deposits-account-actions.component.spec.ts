import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositsAccountActionsComponent } from './fixed-deposits-account-actions.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('FixedDepositsAccountActionsComponent', () => {
  let component: FixedDepositsAccountActionsComponent;
  let fixture: ComponentFixture<FixedDepositsAccountActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositsAccountActionsComponent],
      providers: [RouterTestingModule]
    }).compileComponents();
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
