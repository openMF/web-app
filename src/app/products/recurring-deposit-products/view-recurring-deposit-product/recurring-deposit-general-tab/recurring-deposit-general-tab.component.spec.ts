import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositGeneralTabComponent } from './recurring-deposit-general-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('RecurringDepositGeneralTabComponent', () => {
  let component: RecurringDepositGeneralTabComponent;
  let fixture: ComponentFixture<RecurringDepositGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecurringDepositGeneralTabComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
