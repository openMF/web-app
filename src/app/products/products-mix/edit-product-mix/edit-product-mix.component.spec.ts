import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProductMixComponent } from './edit-product-mix.component';

describe('EditProductMixComponent', () => {
  let component: EditProductMixComponent;
  let fixture: ComponentFixture<EditProductMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProductMixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProductMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
