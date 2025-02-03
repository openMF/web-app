import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCollateralComponent } from './edit-collateral.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditCollateralComponent', () => {
  let component: EditCollateralComponent;
  let fixture: ComponentFixture<EditCollateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCollateralComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCollateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
