import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivateFixedDepositsAccountComponent } from './activate-fixed-deposits-account.component';

describe('ActivateFixedDepositsAccountComponent', () => {
  let component: ActivateFixedDepositsAccountComponent;
  let fixture: ComponentFixture<ActivateFixedDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateFixedDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
