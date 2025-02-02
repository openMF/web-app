import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProductMixComponent } from './create-product-mix.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('CreateProductMixComponent', () => {
  let component: CreateProductMixComponent;
  let fixture: ComponentFixture<CreateProductMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateProductMixComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
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
