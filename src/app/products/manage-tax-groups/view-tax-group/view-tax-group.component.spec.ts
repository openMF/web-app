import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTaxGroupComponent } from './view-tax-group.component';

describe('ViewTaxGroupComponent', () => {
  let component: ViewTaxGroupComponent;
  let fixture: ComponentFixture<ViewTaxGroupComponent>;

  beforeEach(async(() => {
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
