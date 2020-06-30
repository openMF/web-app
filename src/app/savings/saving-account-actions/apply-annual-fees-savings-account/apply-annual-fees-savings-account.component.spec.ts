import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyAnnualFeesSavingsAccountComponent } from './apply-annual-fees-savings-account.component';

describe('ApplyAnnualFeesSavingsAccountComponent', () => {
  let component: ApplyAnnualFeesSavingsAccountComponent;
  let fixture: ComponentFixture<ApplyAnnualFeesSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyAnnualFeesSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyAnnualFeesSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
