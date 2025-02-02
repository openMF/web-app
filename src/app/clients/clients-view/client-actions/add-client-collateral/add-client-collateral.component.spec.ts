import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientCollateralComponent } from './add-client-collateral.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('AddClientCollateralComponent', () => {
  let component: AddClientCollateralComponent;
  let fixture: ComponentFixture<AddClientCollateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddClientCollateralComponent],
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientCollateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
