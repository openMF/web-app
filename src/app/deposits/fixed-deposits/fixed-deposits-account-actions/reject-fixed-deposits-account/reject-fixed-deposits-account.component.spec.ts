import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectFixedDepositsAccountComponent } from './reject-fixed-deposits-account.component';

describe('RejectFixedDepositsAccountComponent', () => {
  let component: RejectFixedDepositsAccountComponent;
  let fixture: ComponentFixture<RejectFixedDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectFixedDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
