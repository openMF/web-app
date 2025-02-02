import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReagingComponent } from './loan-reaging.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('LoanReagingComponent', () => {
  let component: LoanReagingComponent;
  let fixture: ComponentFixture<LoanReagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanReagingComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanReagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
