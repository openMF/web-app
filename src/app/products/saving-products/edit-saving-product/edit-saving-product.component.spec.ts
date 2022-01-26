import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSavingProductComponent } from './edit-saving-product.component';

describe('EditSavingProductComponent', () => {
  let component: EditSavingProductComponent;
  let fixture: ComponentFixture<EditSavingProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSavingProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSavingProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
