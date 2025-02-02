import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentAllocationTabComponent } from './advance-payment-allocation-tab.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('AdvancePaymentAllocationTabComponent', () => {
  let component: AdvancePaymentAllocationTabComponent;
  let fixture: ComponentFixture<AdvancePaymentAllocationTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdvancePaymentAllocationTabComponent],
      imports: [
        MatDialogModule,
        TranslateModule
      ],
      providers: [TranslateService]
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancePaymentAllocationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
