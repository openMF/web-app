import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewProductMixComponent } from './view-product-mix.component';

describe('ViewProductMixComponent', () => {
  let component: ViewProductMixComponent;
  let fixture: ComponentFixture<ViewProductMixComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewProductMixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProductMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
