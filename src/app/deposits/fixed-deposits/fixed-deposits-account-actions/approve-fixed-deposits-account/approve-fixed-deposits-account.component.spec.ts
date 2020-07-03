import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveFixedDepositsAccountComponent } from './approve-fixed-deposits-account.component';

describe('ApproveFixedDepositsAccountComponent', () => {
  let component: ApproveFixedDepositsAccountComponent;
  let fixture: ComponentFixture<ApproveFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveFixedDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
