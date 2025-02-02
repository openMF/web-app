import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTermVariationsTabComponent } from './loan-term-variations-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';

describe('LoanTermVariationsTabComponent', () => {
  let component: LoanTermVariationsTabComponent;
  let fixture: ComponentFixture<LoanTermVariationsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanTermVariationsTabComponent],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanTermVariationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
