import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewShareProductComponent } from './view-share-product.component';

describe('ViewShareProductComponent', () => {
  let component: ViewShareProductComponent;
  let fixture: ComponentFixture<ViewShareProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewShareProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewShareProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
