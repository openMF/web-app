import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductAllocationSettingComponent } from './loan-product-allocation-setting.component';

describe('LoanProductAllocationSettingComponent', () => {
  let component: LoanProductAllocationSettingComponent;
  let fixture: ComponentFixture<LoanProductAllocationSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductAllocationSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductAllocationSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
