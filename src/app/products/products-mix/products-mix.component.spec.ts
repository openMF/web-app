import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductsMixComponent } from './products-mix.component';

describe('ProductsMixComponent', () => {
  let component: ProductsMixComponent;
  let fixture: ComponentFixture<ProductsMixComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductsMixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
