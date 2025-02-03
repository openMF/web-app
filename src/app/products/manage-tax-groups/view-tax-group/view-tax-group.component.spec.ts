import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTaxGroupComponent } from './view-tax-group.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewTaxGroupComponent', () => {
  let component: ViewTaxGroupComponent;
  let fixture: ComponentFixture<ViewTaxGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewTaxGroupComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
