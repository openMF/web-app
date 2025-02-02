import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsTransactionGeneralTabComponent } from './savings-transaction-general-tab.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('SavingsTransactionGeneralTabComponent', () => {
  let component: SavingsTransactionGeneralTabComponent;
  let fixture: ComponentFixture<SavingsTransactionGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingsTransactionGeneralTabComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsTransactionGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
