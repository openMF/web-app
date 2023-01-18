import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositDatatableTabComponent } from './fixed-deposit-datatable-tab.component';

describe('FixedDepositDatatableTabComponent', () => {
  let component: FixedDepositDatatableTabComponent;
  let fixture: ComponentFixture<FixedDepositDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixedDepositDatatableTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
