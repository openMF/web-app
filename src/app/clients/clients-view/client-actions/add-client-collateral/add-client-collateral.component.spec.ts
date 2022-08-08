import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientCollateralComponent } from './add-client-collateral.component';

describe('AddClientCollateralComponent', () => {
  let component: AddClientCollateralComponent;
  let fixture: ComponentFixture<AddClientCollateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddClientCollateralComponent ]
    })
    .compileComponents();
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
