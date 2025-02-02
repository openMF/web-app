import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFundsComponent } from './manage-funds.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('ManageFundsComponent', () => {
  let component: ManageFundsComponent;
  let fixture: ComponentFixture<ManageFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageFundsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
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
    fixture = TestBed.createComponent(ManageFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
