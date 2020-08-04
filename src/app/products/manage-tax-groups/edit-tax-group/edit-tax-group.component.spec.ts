import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaxGroupComponent } from './edit-tax-group.component';

describe('EditTaxGroupComponent', () => {
  let component: EditTaxGroupComponent;
  let fixture: ComponentFixture<EditTaxGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTaxGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTaxGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
