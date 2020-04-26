import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTaxComponentComponent } from './create-tax-component.component';

describe('CreateTaxComponentComponent', () => {
  let component: CreateTaxComponentComponent;
  let fixture: ComponentFixture<CreateTaxComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTaxComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTaxComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
