import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCollateralComponent } from './view-collateral.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewCollateralComponent', () => {
  let component: ViewCollateralComponent;
  let fixture: ComponentFixture<ViewCollateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewCollateralComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCollateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
