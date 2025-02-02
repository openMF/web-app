import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettleCashComponent } from './settle-cash.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('SettleCashComponent', () => {
  let component: SettleCashComponent;
  let fixture: ComponentFixture<SettleCashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SettleCashComponent],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettleCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
