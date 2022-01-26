import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCollateralComponent } from './add-collateral.component';

describe('AddCollateralComponent', () => {
  let component: AddCollateralComponent;
  let fixture: ComponentFixture<AddCollateralComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCollateralComponent ]
    })
    .compileComponents();
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
