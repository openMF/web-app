import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateShareProductComponent } from './create-share-product.component';

describe('CreateShareProductComponent', () => {
  let component: CreateShareProductComponent;
  let fixture: ComponentFixture<CreateShareProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateShareProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateShareProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
