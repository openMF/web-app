import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductDatatableTabComponent } from './saving-product-datatable-tab.component';

describe('SavingProductDatatableTabComponent', () => {
  let component: SavingProductDatatableTabComponent;
  let fixture: ComponentFixture<SavingProductDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavingProductDatatableTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
