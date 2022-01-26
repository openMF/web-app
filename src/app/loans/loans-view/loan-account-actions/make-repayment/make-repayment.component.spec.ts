import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MakeRepaymentComponent } from './make-repayment.component';

describe('MakeRepaymentComponent', () => {
  let component: MakeRepaymentComponent;
  let fixture: ComponentFixture<MakeRepaymentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeRepaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeRepaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
