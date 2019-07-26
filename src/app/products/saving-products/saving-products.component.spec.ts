import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductsComponent } from './saving-products.component';

describe('SavingProductsComponent', () => {
  let component: SavingProductsComponent;
  let fixture: ComponentFixture<SavingProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
