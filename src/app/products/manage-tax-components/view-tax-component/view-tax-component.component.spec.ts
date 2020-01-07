import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTaxComponentComponent } from './view-tax-component.component';

describe('ViewTaxComponentComponent', () => {
  let component: ViewTaxComponentComponent;
  let fixture: ComponentFixture<ViewTaxComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTaxComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTaxComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
