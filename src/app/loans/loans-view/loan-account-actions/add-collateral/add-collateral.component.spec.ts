import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollateralComponent } from './add-collateral.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('AddCollateralComponent', () => {
  let component: AddCollateralComponent;
  let fixture: ComponentFixture<AddCollateralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddCollateralComponent],
      imports: [ReactiveFormsModule]
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
