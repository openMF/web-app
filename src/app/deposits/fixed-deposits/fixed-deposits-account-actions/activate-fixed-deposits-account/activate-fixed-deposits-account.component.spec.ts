import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateFixedDepositsAccountComponent } from './activate-fixed-deposits-account.component';

describe('ActivateFixedDepositsAccountComponent', () => {
  let component: ActivateFixedDepositsAccountComponent;
  let fixture: ComponentFixture<ActivateFixedDepositsAccountComponent>;

  beforeEach(async(() => {
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
