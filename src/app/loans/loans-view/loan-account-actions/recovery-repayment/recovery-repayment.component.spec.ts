import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecoveryRepaymentComponent } from './recovery-repayment.component';

describe('RecoveryRepaymentComponent', () => {
  let component: RecoveryRepaymentComponent;
  let fixture: ComponentFixture<RecoveryRepaymentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecoveryRepaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoveryRepaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
