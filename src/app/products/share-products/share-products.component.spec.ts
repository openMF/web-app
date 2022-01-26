import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareProductsComponent } from './share-products.component';

describe('ShareProductsComponent', () => {
  let component: ShareProductsComponent;
  let fixture: ComponentFixture<ShareProductsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
