import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShareProductComponent } from './view-share-product.component';

describe('ViewShareProductComponent', () => {
  let component: ViewShareProductComponent;
  let fixture: ComponentFixture<ViewShareProductComponent>;

  beforeEach(async(() => {
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
