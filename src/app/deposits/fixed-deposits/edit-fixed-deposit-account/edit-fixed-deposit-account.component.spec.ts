import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFixedDepositAccountComponent } from './edit-fixed-deposit-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EditFixedDepositAccountComponent', () => {
  let component: EditFixedDepositAccountComponent;
  let fixture: ComponentFixture<EditFixedDepositAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditFixedDepositAccountComponent],
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
    fixture = TestBed.createComponent(EditFixedDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
