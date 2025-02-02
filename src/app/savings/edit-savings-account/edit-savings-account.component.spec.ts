import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSavingsAccountComponent } from './edit-savings-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EditSavingsAccountComponent', () => {
  let component: EditSavingsAccountComponent;
  let fixture: ComponentFixture<EditSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSavingsAccountComponent],
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
    fixture = TestBed.createComponent(EditSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
