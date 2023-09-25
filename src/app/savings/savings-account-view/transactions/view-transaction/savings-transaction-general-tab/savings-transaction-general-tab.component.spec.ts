import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsTransactionGeneralTabComponent } from './savings-transaction-general-tab.component';

describe('SavingsTransactionGeneralTabComponent', () => {
  let component: SavingsTransactionGeneralTabComponent;
  let fixture: ComponentFixture<SavingsTransactionGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavingsTransactionGeneralTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingsTransactionGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
