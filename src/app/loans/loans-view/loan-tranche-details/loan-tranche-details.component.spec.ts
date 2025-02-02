import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTrancheDetailsComponent } from './loan-tranche-details.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoanTrancheDetailsComponent', () => {
  let component: LoanTrancheDetailsComponent;
  let fixture: ComponentFixture<LoanTrancheDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanTrancheDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanTrancheDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
