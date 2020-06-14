import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAccountChargesStepComponent } from './shares-account-charges-step.component';

describe('SharesAccountChargesStepComponent', () => {
  let component: SharesAccountChargesStepComponent;
  let fixture: ComponentFixture<SharesAccountChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharesAccountChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
