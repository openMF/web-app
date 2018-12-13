import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsMixComponent } from './products-mix.component';

describe('ProductsMixComponent', () => {
  let component: ProductsMixComponent;
  let fixture: ComponentFixture<ProductsMixComponent>;

  beforeEach(async(() => {
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
