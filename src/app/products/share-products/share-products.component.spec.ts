import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductsComponent } from './share-products.component';

describe('ShareProductsComponent', () => {
  let component: ShareProductsComponent;
  let fixture: ComponentFixture<ShareProductsComponent>;

  beforeEach(async(() => {
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
