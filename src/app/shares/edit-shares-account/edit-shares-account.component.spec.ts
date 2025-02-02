import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSharesAccountComponent } from './edit-shares-account.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('EditSharesAccountComponent', () => {
  let component: EditSharesAccountComponent;
  let fixture: ComponentFixture<EditSharesAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSharesAccountComponent],
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
    fixture = TestBed.createComponent(EditSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
