import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProductMixComponent } from './create-product-mix.component';

describe('CreateProductMixComponent', () => {
  let component: CreateProductMixComponent;
  let fixture: ComponentFixture<CreateProductMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateProductMixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProductMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
