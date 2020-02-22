import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaxComponentComponent } from './edit-tax-component.component';

describe('EditTaxComponentComponent', () => {
  let component: EditTaxComponentComponent;
  let fixture: ComponentFixture<EditTaxComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTaxComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTaxComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
