import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountDatatableStepComponent } from './loans-account-datatable-step.component';

describe('LoansAccountDatatableStepComponent', () => {
  let component: LoansAccountDatatableStepComponent;
  let fixture: ComponentFixture<LoansAccountDatatableStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoansAccountDatatableStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountDatatableStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
