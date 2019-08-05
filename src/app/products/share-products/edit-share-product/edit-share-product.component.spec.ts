import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShareProductComponent } from './edit-share-product.component';

describe('EditShareProductComponent', () => {
  let component: EditShareProductComponent;
  let fixture: ComponentFixture<EditShareProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditShareProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditShareProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
