import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewSavingProductComponent } from './view-saving-product.component';

describe('ViewSavingProductComponent', () => {
  let component: ViewSavingProductComponent;
  let fixture: ComponentFixture<ViewSavingProductComponent>;

  beforeEach(waitForAsync(() => {
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
