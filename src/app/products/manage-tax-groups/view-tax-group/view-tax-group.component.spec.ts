import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewTaxGroupComponent } from './view-tax-group.component';

describe('ViewTaxGroupComponent', () => {
  let component: ViewTaxGroupComponent;
  let fixture: ComponentFixture<ViewTaxGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTaxGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTaxGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
