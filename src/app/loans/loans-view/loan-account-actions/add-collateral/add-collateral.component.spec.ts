import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollateralComponent } from './add-collateral.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('AddCollateralComponent', () => {
  let component: AddCollateralComponent;
  let fixture: ComponentFixture<AddCollateralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddCollateralComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCollateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
