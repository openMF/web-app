import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSavingProductComponent } from './create-saving-product.component';

describe('CreateSavingProductComponent', () => {
  let component: CreateSavingProductComponent;
  let fixture: ComponentFixture<CreateSavingProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSavingProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSavingProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
