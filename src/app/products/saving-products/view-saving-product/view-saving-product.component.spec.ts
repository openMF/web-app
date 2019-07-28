import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSavingProductComponent } from './view-saving-product.component';

describe('ViewSavingProductComponent', () => {
  let component: ViewSavingProductComponent;
  let fixture: ComponentFixture<ViewSavingProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSavingProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSavingProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
